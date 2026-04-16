import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const seasonId = formData.get('seasonId') as string

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    // Read the Excel file
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })

    // Try different possible sheet name variations
    const sheetName = Object.keys(workbook.Sheets).find(name =>
      name.toLowerCase().replace(/\s/g, '') === 'totalpoints'
    )

    if (!sheetName) {
      const availableSheets = Object.keys(workbook.Sheets).join(', ')
      return NextResponse.json({
        error: `TotalPoints sheet not found. Available sheets: ${availableSheets}`
      }, { status: 400 })
    }

    const sheet = workbook.Sheets[sheetName]
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { raw: false, dateNF: 'yyyy-mm-dd' })

    let playersUpserted = 0
    let eventsUpserted = 0
    let resultsUpserted = 0
    let skipped = 0

    const playersMap = new Map<number, any>()
    const eventsMap = new Map<number, any>()

    for (const row of rows) {
      const playerId = parseInt(row['Player Id'])
      const eventId = parseInt(row['Tournament Id'])

      if (isNaN(playerId) || isNaN(eventId)) { skipped++; continue }

      // Player data
      if (!playersMap.has(playerId)) {
        playersMap.set(playerId, {
          id: playerId,
          forename: row['Forename'] || '',
          surname: row['Surname'] || '',
          full_name: row['Full Name'] || '',
          date_of_birth: parseDOB(row['Date Of Birth']),
          card_number: parseInt(row['Card Number']) || null,
          membership_number: parseInt(row['Membership Number']) || null,
          gdpr: row['GDPR'] === '1' || row['GDPR'] === 1,
          home_casino: row['Casino'] || '',
        })
      }

      // Event data
      if (!eventsMap.has(eventId)) {
        const tournamentName = row['Tournament Name'] || ''
        const buyInRaw = row['Buy In']
        const buyIn = isNaN(parseFloat(buyInRaw)) ? 0 : parseFloat(buyInRaw)
        const isHighRoller = tournamentName.toLowerCase().includes('high roller')
        const isLowRoller = !isHighRoller && buyIn <= 300

        eventsMap.set(eventId, {
          id: eventId,
          season_id: parseInt(seasonId),
          casino: row['Casino'] || '',
          tournament_name: tournamentName,
          start_date: parseDate(row['Start Date']),
          buy_in: buyIn,
          is_high_roller: isHighRoller,
          is_low_roller: isLowRoller,
          web_sync_site_id: parseInt(row['Web Sync Site Id']) || null,
        })
      }
    }

    // Upsert players in batches of 100
    const playerChunks = chunkArray(Array.from(playersMap.values()), 100)
    for (const chunk of playerChunks) {
      const { error } = await supabaseAdmin
        .from('players')
        .upsert(chunk, { onConflict: 'id' })
      if (error) throw new Error(`Players upsert error: ${error.message}`)
      playersUpserted += chunk.length
    }

    // Upsert events in batches of 100
    const eventChunks = chunkArray(Array.from(eventsMap.values()), 100)
    for (const chunk of eventChunks) {
      const { error } = await supabaseAdmin
        .from('events')
        .upsert(chunk, { onConflict: 'id' })
      if (error) throw new Error(`Events upsert error: ${error.message}`)
      eventsUpserted += chunk.length
    }

    // Upsert results
    const resultRows = []
    for (const row of rows) {
      const playerId = parseInt(row['Player Id'])
      const eventId = parseInt(row['Tournament Id'])
      if (isNaN(playerId) || isNaN(eventId)) continue

      const points = parseFloat(row['Points'])
      const finishPosition = parseInt(row['Position'])
      const prizePosition = parseInt(row['Position Of Prize']) || 0
      const prizeAmount = parseFloat(row['Prize Amount']) || 0

      if (isNaN(points)) continue

      resultRows.push({
        player_id: playerId,
        event_id: eventId,
        season_id: parseInt(seasonId),
        finish_position: isNaN(finishPosition) ? 0 : finishPosition,
        points: points,
        prize_position: prizePosition,
        prize_amount: isNaN(prizeAmount) ? 0 : prizeAmount,
        updated_at: new Date().toISOString(),
      })
    }

    // Upsert results in batches of 100
    const resultChunks = chunkArray(resultRows, 100)
    for (const chunk of resultChunks) {
      const { error } = await supabaseAdmin
        .from('results')
        .upsert(chunk, { onConflict: 'player_id,event_id' })
      if (error) throw new Error(`Results upsert error: ${error.message}`)
      resultsUpserted += chunk.length
    }

    return NextResponse.json({
      success: true,
      summary: {
        players: playersUpserted,
        events: eventsUpserted,
        results: resultsUpserted,
        skipped,
      }
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function parseDOB(raw: string): string | null {
  if (!raw || raw === 'NULL' || raw === '') return null
  try {
    const parts = raw.split('/')
    if (parts.length !== 3) return null
    const month = parts[0].padStart(2, '0')
    const day = parts[1].padStart(2, '0')
    const yearShort = parseInt(parts[2])
    const year = yearShort <= 30 ? 2000 + yearShort : 1900 + yearShort
    return `${year}-${month}-${day}`
  } catch {
    return null
  }
}

function parseDate(raw: string): string | null {
  if (!raw || raw === 'NULL' || raw === '') return null
  try {
    // Format: M/D/YY HH:mm e.g. "3/31/26 18:04"
    const [datePart, timePart] = raw.toString().split(' ')
    if (!datePart) return null
    const parts = datePart.split('/')
    if (parts.length !== 3) return null
    const month = parts[0].padStart(2, '0')
    const day = parts[1].padStart(2, '0')
    const yearShort = parseInt(parts[2])
    const year = yearShort <= 30 ? 2000 + yearShort : 1900 + yearShort
    const time = timePart || '00:00'
    return `${year}-${month}-${day}T${time}:00`
  } catch {
    return null
  }
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}