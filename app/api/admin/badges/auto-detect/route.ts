import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getNPLLeaderboard, getHighRollerLeaderboard, getLowRollerLeaderboard } from '@/lib/calculations'

export async function POST() {
  try {
    const { data: seasons } = await supabaseAdmin
      .from('seasons')
      .select('*')
      .order('year')

    if (!seasons || seasons.length === 0) {
      return NextResponse.json({ awarded: 0 })
    }

    let awarded = 0

    for (const season of seasons) {
      const [npl, hr, lr] = await Promise.all([
        getNPLLeaderboard(season.id),
        getHighRollerLeaderboard(season.id),
        getLowRollerLeaderboard(season.id),
      ])

      const winners = [
        { board: npl, key: `npl_winner_${season.year}`, name: `NPL Winner ${season.year}` },
        { board: hr,  key: `hr_winner_${season.year}`,  name: `High Roller Winner ${season.year}` },
        { board: lr,  key: `lr_winner_${season.year}`,  name: `Low Roller Winner ${season.year}` },
      ]

      for (const { board, key, name } of winners) {
        if (!board || board.length === 0) continue
        const winner = board[0]
        if (!winner.gdpr) continue

        const { error } = await supabaseAdmin
          .from('player_badges')
          .upsert({
            player_id: winner.player_id,
            badge_key: key,
            badge_name: name,
            season_year: season.year,
            awarded_by: 'Auto-detected',
          }, { onConflict: 'player_id,badge_key' })

        if (!error) awarded++
      }
    }

    return NextResponse.json({ success: true, awarded })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}