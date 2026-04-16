import { supabase } from './supabase'
import { LeaderboardEntry } from './types'

async function fetchAllResults(seasonId: number, selectQuery: string) {
  let allResults: any[] = []
  let from = 0
  const batchSize = 1000

  while (true) {
    const { data, error } = await supabase
      .from('results')
      .select(selectQuery)
      .eq('season_id', seasonId)
      .range(from, from + batchSize - 1)

    if (error) break
    if (!data || data.length === 0) break
    allResults = allResults.concat(data)
    if (data.length < batchSize) break
    from += batchSize
  }

  return allResults
}

export async function getNPLLeaderboard(seasonId: number): Promise<LeaderboardEntry[]> {
  // NPL = ALL events count, top 20 results used + 2pts per extra result
  const allResults = await fetchAllResults(
    seasonId,
    'player_id, points, prize_amount, finish_position, players(full_name, gdpr, home_casino)'
  )

  if (allResults.length === 0) return []

  const playerMap = new Map<number, any>()

  for (const r of allResults) {
    const player = r.players as any
    if (!playerMap.has(r.player_id)) {
      playerMap.set(r.player_id, {
        player_id: r.player_id,
        full_name: player?.full_name || '',
        gdpr: player?.gdpr ?? true,
        home_casino: player?.home_casino || '',
        all_points: [],
        total_prize_money: 0,
        best_finish: 999,
      })
    }
    const entry = playerMap.get(r.player_id)
    entry.all_points.push(r.points)
    entry.total_prize_money += r.prize_amount || 0
    if (r.finish_position < entry.best_finish) {
      entry.best_finish = r.finish_position
    }
  }

  const leaderboard: LeaderboardEntry[] = []

  for (const [, entry] of playerMap) {
    const sorted = [...entry.all_points].sort((a: number, b: number) => b - a)
    const top20 = sorted.slice(0, 20)
    const extraResults = Math.max(0, sorted.length - 20)
    const total_points = top20.reduce((sum: number, p: number) => sum + p, 0) + extraResults * 2

    leaderboard.push({
      player_id: entry.player_id,
      full_name: entry.full_name,
      gdpr: entry.gdpr,
      home_casino: entry.home_casino,
      total_points: Math.round(total_points * 100) / 100,
      result_count: sorted.length,
      counted_results: Math.min(sorted.length, 20),
      total_prize_money: entry.total_prize_money,
      best_finish: entry.best_finish === 999 ? 0 : entry.best_finish,
    })
  }

  return leaderboard.sort((a, b) => b.total_points - a.total_points)
}

export async function getHighRollerLeaderboard(seasonId: number): Promise<LeaderboardEntry[]> {
  // High Roller = ONLY High Roller events, ALL results count, no cap
  const allResults = await fetchAllResults(
    seasonId,
    'player_id, points, prize_amount, finish_position, players(full_name, gdpr, home_casino), events(is_high_roller)'
  )

  if (allResults.length === 0) return []

  const playerMap = new Map<number, any>()

  for (const r of allResults) {
    const event = r.events as any
    if (!event?.is_high_roller) continue

    const player = r.players as any
    if (!playerMap.has(r.player_id)) {
      playerMap.set(r.player_id, {
        player_id: r.player_id,
        full_name: player?.full_name || '',
        gdpr: player?.gdpr ?? true,
        home_casino: player?.home_casino || '',
        total_points: 0,
        result_count: 0,
        total_prize_money: 0,
        best_finish: 999,
      })
    }
    const entry = playerMap.get(r.player_id)
    entry.total_points += r.points
    entry.result_count += 1
    entry.total_prize_money += r.prize_amount || 0
    if (r.finish_position < entry.best_finish) entry.best_finish = r.finish_position
  }

  return Array.from(playerMap.values())
    .map(e => ({
      ...e,
      counted_results: e.result_count,
      best_finish: e.best_finish === 999 ? 0 : e.best_finish,
      total_points: Math.round(e.total_points * 100) / 100,
    }))
    .sort((a, b) => b.total_points - a.total_points)
}

export async function getLowRollerLeaderboard(seasonId: number): Promise<LeaderboardEntry[]> {
  // Low Roller = ONLY events with buy-in <= 300, ALL results count, no cap
  const allResults = await fetchAllResults(
    seasonId,
    'player_id, points, prize_amount, finish_position, players(full_name, gdpr, home_casino), events(is_low_roller, buy_in)'
  )

  if (allResults.length === 0) return []

  const playerMap = new Map<number, any>()

  for (const r of allResults) {
    const event = r.events as any
    if (!event?.is_low_roller) continue

    const player = r.players as any
    if (!playerMap.has(r.player_id)) {
      playerMap.set(r.player_id, {
        player_id: r.player_id,
        full_name: player?.full_name || '',
        gdpr: player?.gdpr ?? true,
        home_casino: player?.home_casino || '',
        total_points: 0,
        result_count: 0,
        total_prize_money: 0,
        best_finish: 999,
      })
    }
    const entry = playerMap.get(r.player_id)
    entry.total_points += r.points
    entry.result_count += 1
    entry.total_prize_money += r.prize_amount || 0
    if (r.finish_position < entry.best_finish) entry.best_finish = r.finish_position
  }

  return Array.from(playerMap.values())
    .map(e => ({
      ...e,
      counted_results: e.result_count,
      best_finish: e.best_finish === 999 ? 0 : e.best_finish,
      total_points: Math.round(e.total_points * 100) / 100,
    }))
    .sort((a, b) => b.total_points - a.total_points)
}