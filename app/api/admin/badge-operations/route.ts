// app/api/admin/badge-operations/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { updatePlayerLifetimeStats, autoAwardBadges } from '@/lib/badge-calculator'

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (!action) {
      return NextResponse.json({ error: 'Action required' }, { status: 400 })
    }

    // Create job record in Supabase (instead of in-memory Map)
    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .insert({
        type: 'badge_operation',
        status: 'pending',
        created_by: 'admin',
        metadata: { action },
        progress_percent: 0,
        current_item: 0,
      })
      .select()
      .single()

    if (jobError) {
      console.error('Job creation error:', jobError)
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
    }

    // Return job ID immediately - don't wait for completion
    // The client will poll the GET endpoint
    if (action === 'update_stats_all') {
      // Start background task
      runUpdateStatsJob(job.id).catch((err) => {
        failJob(job.id, err)
      })
    } else if (action === 'auto_award_all') {
      // Start background task
      runAutoAwardJob(job.id).catch((err) => {
        failJob(job.id, err)
      })
    } else {
      return NextResponse.json(
        { error: 'Unknown action' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, jobId: job.id })
  } catch (error: any) {
    console.error('Badge operation error:', error)
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
      total: job.total_items || 0,
      current: job.current_item,
      status: job.metadata?.action 
        ? `${job.metadata.action === 'update_stats_all' ? 'Updating stats' : 'Auto-awarding badges'} (${job.progress_percent}%)...`
        : 'Processing...',
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
// BACKGROUND JOBS
// ============================================================================

async function runUpdateStatsJob(jobId: string) {
  try {
    // Mark as in progress
    await updateJob(jobId, 'in_progress')

    // Fetch all players with GDPR consent
    const { data: players, error } = await supabaseAdmin
      .from('players')
      .select('id')
      .eq('gdpr', true)

    if (error) throw error

    const total = players?.length || 0

    // Update total items
    await supabaseAdmin
      .from('jobs')
      .update({ total_items: total })
      .eq('id', jobId)

    let updated = 0

    // Process each player
    for (const player of players || []) {
      try {
        await updatePlayerLifetimeStats(player.id)
        updated++

        // Update progress every 5 players (to reduce DB writes)
        if (updated % 5 === 0 || updated === total) {
          await updateProgress(jobId, updated, total)
        }
      } catch (err) {
        console.error(`Error updating stats for player ${player.id}:`, err)
        // Continue with next player
      }
    }

    // Complete
    await completeJob(jobId, {
      playersUpdated: updated,
      success: true,
    })
  } catch (error) {
    await failJob(jobId, error)
  }
}

async function runAutoAwardJob(jobId: string) {
  try {
    // Mark as in progress
    await updateJob(jobId, 'in_progress')

    // Fetch all players with GDPR consent
    const { data: players, error } = await supabaseAdmin
      .from('players')
      .select('id')
      .eq('gdpr', true)

    if (error) throw error

    const total = players?.length || 0

    // Update total items
    await supabaseAdmin
      .from('jobs')
      .update({ total_items: total })
      .eq('id', jobId)

    let processed = 0
    let totalBadgesAwarded = 0

    // Process each player
    for (const player of players || []) {
      try {
        const result = await autoAwardBadges(player.id)
        totalBadgesAwarded += result.awarded.length
        processed++

        // Update progress every 5 players
        if (processed % 5 === 0 || processed === total) {
          await updateProgress(jobId, processed, total)
        }
      } catch (err) {
        console.error(`Error awarding badges for player ${player.id}:`, err)
        // Continue with next player
      }
    }

    // Complete
    await completeJob(jobId, {
      playersProcessed: processed,
      badgesAwarded: totalBadgesAwarded,
      success: true,
    })
  } catch (error) {
    await failJob(jobId, error)
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function updateJob(jobId: string, status: string) {
  const { error } = await supabaseAdmin
    .from('jobs')
    .update({ status })
    .eq('id', jobId)

  if (error) throw error
}

async function updateProgress(jobId: string, current: number, total: number) {
  const progress = Math.round((current / total) * 100)

  const { error } = await supabaseAdmin
    .from('jobs')
    .update({
      current_item: current,
      total_items: total,
      progress_percent: progress,
    })
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