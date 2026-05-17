// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import * as XLSX from 'xlsx'
import { updatePlayerLifetimeStats, autoAwardBadges } from '@/lib/badge-calculator'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const seasonId = formData.get('seasonId') as string
    const trackProgress = formData.get('trackProgress') === 'true'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Create job record in Supabase (instead of in-memory Map)
    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .insert({
        type: 'file_upload',
        status: 'pending',
        created_by: 'admin',
        metadata: {
          filename: file.name,
          size: file.size,
          seasonId,
        },
        progress_percent: 0,
        current_item: 0,
      })
      .select()
      .single()

    if (jobError) {
      console.error('Job creation error:', jobError)
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
    }

    // If progress tracking requested, return immediately
    if (trackProgress) {
      // Start background upload job
      runUploadJob(job.id, file, seasonId).catch((err) => {
        failJob(job.id, err)
      })

      return NextResponse.json({ success: true, jobId: job.id, trackProgress: true })
    }

    // Otherwise run synchronously (backwards compatible)
    const result = await runUploadSync(file, seasonId, job.id)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const jobId = request.nextUrl.searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
    }

    // Fetch job from Supabase (no in-memory Map lookup)
    const { data: job, error } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (error || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Return job data in format compatible with existing client code
    return NextResponse.json({
      stage: job.metadata?.stage || 'processing',
      percent: job.progress_percent,
      message: job.metadata?.message || 'Processing...',
      completed: ['completed', 'failed', 'cancelled'].includes(job.status),
      error: job.result?.error,
      result: job.result,
    })
  } catch (error: any) {
    console.error('Job fetch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// ============================================================================
// BACKGROUND JOB - ASYNC UPLOAD WITH PROGRESS
// ============================================================================

async function runUploadJob(jobId: string, file: File, seasonId: string) {
  try {
    await updateJobStatus(jobId, 'in_progress', {
      stage: 'reading',
      message: 'Reading Excel file...',
    })

    // Read file
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })

    const sheetName = Object.keys(workbook.Sheets).find((name) =>
      name.toLowerCase().replace(/\s/g, '') === 'totalpoints'
    )

    if (!sheetName) {
      throw new Error('TotalPoints sheet not found')
    }

    const sheet = workbook.Sheets[sheetName]
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { raw: false, dateNF: 'yyyy-mm-dd' })

    // Stage 2: Parse data
    await updateProgress(jobId, 10, 100, {
      stage: 'parsing',
      message: 'Parsing data...',
    })

    const playersMap = new Map()
    const eventsMap = new Map()
    const resultRows = []
    let skipped = 0

    for (const row of rows) {
      const playerId = parseInt(row['Player Id'])
      const eventId = parseInt(row['Tournament Id'])

      if (isNaN(playerId) || isNaN(eventId)) {
        skipped++
        continue
      }

      // Collect players
      if (!playersMap.has(playerId)) {
        playersMap.set(playerId, {
          id: playerId,
          full_name: row['Player Name'] || 'Unknown',
          updated_at: new Date().toISOString(),
        })
      }

      // Collect events
      if (!eventsMap.has(eventId)) {
        eventsMap.set(eventId, {
          id: eventId,
          name: row['Tournament Name'] || 'Unknown',
          season_id: parseInt(seasonId),
          updated_at: new Date().toISOString(),
        })
      }

      // Parse result
      const points = parseFloat(row['Points'])
      if (isNaN(points)) {
        skipped++
        continue
      }

      const finishPosition = parseInt(row['Position'])
      const prizePosition = parseInt(row['Position Of Prize']) || 0
      const prizeAmount = parseFloat(row['Prize Amount']) || 0

      resultRows.push({
        player_id: playerId,
        event_id: eventId,
        season_id: parseInt(seasonId),
        finish_position: isNaN(finishPosition) ? 0 : finishPosition,
        points,
        prize_position: prizePosition,
        prize_amount: isNaN(prizeAmount) ? 0 : prizeAmount,
        updated_at: new Date().toISOString(),
      })
    }

    // Stage 3: Upload players
    await updateProgress(jobId, 15, 100, {
      stage: 'players',
      message: `Uploading ${playersMap.size} players...`,
    })

    const playerChunks = chunkArray(Array.from(playersMap.values()), 100)
    let playersUpserted = 0

    for (let i = 0; i < playerChunks.length; i++) {
      const { error } = await supabaseAdmin
        .from('players')
        .upsert(playerChunks[i], { onConflict: 'id' })

      if (error) throw new Error(`Players upsert error: ${error.message}`)
      playersUpserted += playerChunks[i].length

      await updateProgress(jobId, 15 + (i / playerChunks.length) * 10, 100, {
        stage: 'players',
        message: `Uploaded ${playersUpserted} of ${playersMap.size} players...`,
      })
    }

    // Stage 4: Upload events
    await updateProgress(jobId, 30, 100, {
      stage: 'events',
      message: `Uploading ${eventsMap.size} events...`,
    })

    const eventChunks = chunkArray(Array.from(eventsMap.values()), 100)
    let eventsUpserted = 0

    for (let i = 0; i < eventChunks.length; i++) {
      const { error } = await supabaseAdmin
        .from('events')
        .upsert(eventChunks[i], { onConflict: 'id' })

      if (error) throw new Error(`Events upsert error: ${error.message}`)
      eventsUpserted += eventChunks[i].length

      await updateProgress(jobId, 30 + (i / eventChunks.length) * 10, 100, {
        stage: 'events',
        message: `Uploaded ${eventsUpserted} of ${eventsMap.size} events...`,
      })
    }

    // Stage 5: Upload results
    await updateProgress(jobId, 45, 100, {
      stage: 'results',
      message: 'Uploading results...',
    })

    const resultChunks = chunkArray(resultRows, 100)
    let resultsUpserted = 0

    for (let i = 0; i < resultChunks.length; i++) {
      const { error } = await supabaseAdmin
        .from('results')
        .upsert(resultChunks[i], { onConflict: 'player_id,event_id' })

      if (error) throw new Error(`Results upsert error: ${error.message}`)
      resultsUpserted += resultChunks[i].length

      await updateProgress(jobId, 45 + (i / resultChunks.length) * 15, 100, {
        stage: 'results',
        message: `Uploaded ${resultsUpserted} of ${resultRows.length} results...`,
      })
    }

    // Stage 6: Update stats and awards badges
    await updateProgress(jobId, 65, 100, {
      stage: 'badges',
      message: 'Updating player stats and awarding badges...',
    })

    const playerIds = Array.from(playersMap.keys())
    let statsUpdated = 0
    let badgesAwarded = 0

    for (let i = 0; i < playerIds.length; i++) {
      try {
        await updatePlayerLifetimeStats(playerIds[i])
        statsUpdated++

        const badgeResult = await autoAwardBadges(playerIds[i])
        badgesAwarded += badgeResult.awarded.length
      } catch (err) {
        console.error(`Error processing player ${playerIds[i]}:`, err)
        // Continue with next player
      }

      // Update progress every 10 players
      if ((i + 1) % 10 === 0 || i === playerIds.length - 1) {
        await updateProgress(jobId, 65 + (i / playerIds.length) * 30, 100, {
          stage: 'badges',
          message: `Updated ${statsUpdated} players, ${badgesAwarded} badges awarded...`,
        })
      }
    }

    // Complete
    const result = {
      success: true,
      summary: {
        players: playersUpserted,
        events: eventsUpserted,
        results: resultsUpserted,
        skipped,
      },
      badges: {
        statsUpdated,
        badgesAwarded,
      },
    }

    await completeJob(jobId, result)
  } catch (error) {
    await failJob(jobId, error)
  }
}

// ============================================================================
// SYNCHRONOUS UPLOAD (BACKWARDS COMPATIBLE)
// ============================================================================

async function runUploadSync(file: File, seasonId: string, jobId: string) {
  try {
    // Read file
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })

    const sheetName = Object.keys(workbook.Sheets).find((name) =>
      name.toLowerCase().replace(/\s/g, '') === 'totalpoints'
    )

    if (!sheetName) {
      throw new Error('TotalPoints sheet not found')
    }

    const sheet = workbook.Sheets[sheetName]
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { raw: false, dateNF: 'yyyy-mm-dd' })

    const playersMap = new Map()
    const eventsMap = new Map()
    const resultRows = []
    let skipped = 0

    for (const row of rows) {
      const playerId = parseInt(row['Player Id'])
      const eventId = parseInt(row['Tournament Id'])

      if (isNaN(playerId) || isNaN(eventId)) {
        skipped++
        continue
      }

      if (!playersMap.has(playerId)) {
        playersMap.set(playerId, {
          id: playerId,
          full_name: row['Player Name'] || 'Unknown',
          updated_at: new Date().toISOString(),
        })
      }

      if (!eventsMap.has(eventId)) {
        eventsMap.set(eventId, {
          id: eventId,
          name: row['Tournament Name'] || 'Unknown',
          season_id: parseInt(seasonId),
          updated_at: new Date().toISOString(),
        })
      }

      const points = parseFloat(row['Points'])
      if (isNaN(points)) {
        skipped++
        continue
      }

      const finishPosition = parseInt(row['Position'])
      const prizePosition = parseInt(row['Position Of Prize']) || 0
      const prizeAmount = parseFloat(row['Prize Amount']) || 0

      resultRows.push({
        player_id: playerId,
        event_id: eventId,
        season_id: parseInt(seasonId),
        finish_position: isNaN(finishPosition) ? 0 : finishPosition,
        points,
        prize_position: prizePosition,
        prize_amount: isNaN(prizeAmount) ? 0 : prizeAmount,
        updated_at: new Date().toISOString(),
      })
    }

    // Upsert all data
    const playerChunks = chunkArray(Array.from(playersMap.values()), 100)
    let playersUpserted = 0

    for (const chunk of playerChunks) {
      const { error } = await supabaseAdmin
        .from('players')
        .upsert(chunk, { onConflict: 'id' })
      if (error) throw new Error(`Players upsert error: ${error.message}`)
      playersUpserted += chunk.length
    }

    const eventChunks = chunkArray(Array.from(eventsMap.values()), 100)
    let eventsUpserted = 0

    for (const chunk of eventChunks) {
      const { error } = await supabaseAdmin
        .from('events')
        .upsert(chunk, { onConflict: 'id' })
      if (error) throw new Error(`Events upsert error: ${error.message}`)
      eventsUpserted += chunk.length
    }

    const resultChunks = chunkArray(resultRows, 100)
    let resultsUpserted = 0

    for (const chunk of resultChunks) {
      const { error } = await supabaseAdmin
        .from('results')
        .upsert(chunk, { onConflict: 'player_id,event_id' })
      if (error) throw new Error(`Results upsert error: ${error.message}`)
      resultsUpserted += chunk.length
    }

    // Update stats and badges
    let statsUpdated = 0
    let badgesAwarded = 0

    for (const playerId of playersMap.keys()) {
      await updatePlayerLifetimeStats(playerId)
      statsUpdated++

      const badgeResult = await autoAwardBadges(playerId)
      badgesAwarded += badgeResult.awarded.length
    }

    const result = {
      success: true,
      summary: {
        players: playersUpserted,
        events: eventsUpserted,
        results: resultsUpserted,
        skipped,
      },
      badges: {
        statsUpdated,
        badgesAwarded,
      },
    }

    await completeJob(jobId, result)
    return result
  } catch (error: any) {
    await failJob(jobId, error)
    throw error
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function updateJobStatus(jobId: string, status: string, metadata?: any) {
  const updates: any = { status }
  if (metadata) {
    updates.metadata = metadata
  }

  const { error } = await supabaseAdmin
    .from('jobs')
    .update(updates)
    .eq('id', jobId)

  if (error) throw error
}

async function updateProgress(jobId: string, current: number, total: number, metadata?: any) {
  const progress = Math.round((current / total) * 100)

  const updates: any = {
    current_item: current,
    total_items: total,
    progress_percent: progress,
  }

  if (metadata) {
    updates.metadata = metadata
  }

  const { error } = await supabaseAdmin
    .from('jobs')
    .update(updates)
    .eq('id', jobId)

  if (error) throw error
}

async function completeJob(jobId: string, result: any) {
  const { error } = await supabaseAdmin
    .from('jobs')
    .update({
      status: 'completed',
      result,
      progress_percent: 100,
      completed_at: new Date().toISOString(),
    })
    .eq('id', jobId)

  if (error) throw error
}

async function failJob(jobId: string, error: any) {
  const errorMessage = error instanceof Error ? error.message : String(error)

  const { error: updateError } = await supabaseAdmin
    .from('jobs')
    .update({
      status: 'failed',
      result: { error: errorMessage },
      completed_at: new Date().toISOString(),
    })
    .eq('id', jobId)

  if (updateError) console.error('Failed to update job error:', updateError)
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}