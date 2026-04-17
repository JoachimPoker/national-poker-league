import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { updatePlayerLifetimeStats, autoAwardBadges } from '@/lib/badge-calculator'

// In-memory progress store (in production, use Redis or similar)
const progressStore = new Map<string, {
  total: number
  current: number
  status: string
  completed: boolean
  error?: string
  result?: any
}>()

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    // Generate unique job ID
    const jobId = `${action}-${Date.now()}`
    
    // Initialize progress
    progressStore.set(jobId, {
      total: 0,
      current: 0,
      status: 'Starting...',
      completed: false
    })

    // Start the job in background
    if (action === 'update_stats_all') {
      runUpdateStatsJob(jobId).catch(err => {
        progressStore.set(jobId, {
          ...progressStore.get(jobId)!,
          completed: true,
          error: err.message
        })
      })
    } else if (action === 'auto_award_all') {
      runAutoAwardJob(jobId).catch(err => {
        progressStore.set(jobId, {
          ...progressStore.get(jobId)!,
          completed: true,
          error: err.message
        })
      })
    }

    return NextResponse.json({ success: true, jobId })

  } catch (error: any) {
    console.error('Badge operation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get('jobId')
  
  if (!jobId) {
    return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
  }

  const progress = progressStore.get(jobId)
  
  if (!progress) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  return NextResponse.json(progress)
}

async function runUpdateStatsJob(jobId: string) {
  // Fetch all players with GDPR consent
  const { data: players, error } = await supabaseAdmin
    .from('players')
    .select('id')
    .eq('gdpr', true)

  if (error) throw error

  const total = players?.length || 0
  progressStore.set(jobId, {
    total,
    current: 0,
    status: `Updating stats for ${total} players...`,
    completed: false
  })

  let updated = 0
  for (const player of players || []) {
    await updatePlayerLifetimeStats(player.id)
    updated++
    
    progressStore.set(jobId, {
      total,
      current: updated,
      status: `Updated ${updated} of ${total} players...`,
      completed: false
    })
  }

  progressStore.set(jobId, {
    total,
    current: updated,
    status: 'Complete!',
    completed: true,
    result: { playersUpdated: updated }
  })
}

async function runAutoAwardJob(jobId: string) {
  // Fetch all players with GDPR consent
  const { data: players, error } = await supabaseAdmin
    .from('players')
    .select('id')
    .eq('gdpr', true)

  if (error) throw error

  const total = players?.length || 0
  progressStore.set(jobId, {
    total,
    current: 0,
    status: `Awarding badges to ${total} players...`,
    completed: false
  })

  let processed = 0
  let totalBadgesAwarded = 0

  for (const player of players || []) {
    const result = await autoAwardBadges(player.id)
    totalBadgesAwarded += result.awarded.length
    processed++
    
    progressStore.set(jobId, {
      total,
      current: processed,
      status: `Processed ${processed} of ${total} players (${totalBadgesAwarded} badges awarded)...`,
      completed: false
    })
  }

  progressStore.set(jobId, {
    total,
    current: processed,
    status: 'Complete!',
    completed: true,
    result: { playersProcessed: processed, badgesAwarded: totalBadgesAwarded }
  })
}