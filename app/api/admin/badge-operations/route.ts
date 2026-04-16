import { NextRequest, NextResponse } from 'next/server'
import { 
  autoAwardBadges, 
  autoAwardAllPlayers,
  updatePlayerLifetimeStats,
  updateAllPlayerLifetimeStats,
  awardSeasonRankingBadges,
  awardSeasonSuperlatives,
  calculatePlayerBadges
} from '@/lib/badge-calculator'

// GET /api/admin/badge-operations?action=...
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const playerId = searchParams.get('player_id')

  try {
    switch (action) {
      case 'calculate':
        if (!playerId) {
          return NextResponse.json({ error: 'player_id required' }, { status: 400 })
        }
        const badges = await calculatePlayerBadges(parseInt(playerId))
        return NextResponse.json({ badges })

      case 'stats':
        // Return stats about badge system
        const { data: totalBadges } = await supabaseAdmin
          .from('badge_definitions')
          .select('id', { count: 'exact' })
        
        const { data: totalAwarded } = await supabaseAdmin
          .from('player_badges')
          .select('id', { count: 'exact' })

        const { data: playersWithBadges } = await supabaseAdmin
          .from('player_badges')
          .select('player_id')
        
        const uniquePlayers = new Set(playersWithBadges?.map(b => b.player_id) || []).size

        return NextResponse.json({
          totalBadgeTypes: totalBadges?.length || 0,
          totalBadgesAwarded: totalAwarded?.length || 0,
          playersWithBadges: uniquePlayers
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/admin/badge-operations
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, player_id, season_year, league } = body

  try {
    switch (action) {
      case 'auto_award_single':
        if (!player_id) {
          return NextResponse.json({ error: 'player_id required' }, { status: 400 })
        }
        const result = await autoAwardBadges(player_id)
        return NextResponse.json(result)

      case 'auto_award_all':
        const allResult = await autoAwardAllPlayers()
        return NextResponse.json(allResult)

      case 'update_stats_single':
        if (!player_id) {
          return NextResponse.json({ error: 'player_id required' }, { status: 400 })
        }
        await updatePlayerLifetimeStats(player_id)
        return NextResponse.json({ success: true })

      case 'update_stats_all':
        const updated = await updateAllPlayerLifetimeStats()
        return NextResponse.json({ playersUpdated: updated })

      case 'award_season_rankings':
        if (!season_year) {
          return NextResponse.json({ error: 'season_year required' }, { status: 400 })
        }
        const rankingsAwarded = await awardSeasonRankingBadges(season_year, league || 'npl')
        return NextResponse.json({ awarded: rankingsAwarded })

      case 'award_season_superlatives':
        if (!season_year) {
          return NextResponse.json({ error: 'season_year required' }, { status: 400 })
        }
        const superlativesAwarded = await awardSeasonSuperlatives(season_year)
        return NextResponse.json({ awarded: superlativesAwarded })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}