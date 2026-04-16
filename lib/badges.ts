import { supabase } from './supabase'
import { PlayerStats } from './badge-definitions'

export async function getPlayerLifetimeStats(
  playerId: number,
  seasonId: number,
  nplRank: number,
  allVenues: string[]
): Promise<PlayerStats> {

  let allResults: any[] = []
  let from = 0
  while (true) {
    const { data } = await supabase
      .from('results')
      .select('*, events(*)')
      .eq('player_id', playerId)
      .range(from, from + 999)
    if (!data || data.length === 0) break
    allResults = allResults.concat(data)
    if (data.length < 1000) break
    from += 1000
  }

  const lifetimeWins = allResults.filter(r => r.finish_position === 1).length
  const lifetimeCashes = allResults.length
  const lifetimePrizeMoney = allResults.reduce((sum, r) => sum + (r.prize_amount || 0), 0)

  const seasonResults = allResults.filter(r => r.season_id === seasonId)
  const seasonHRResults = seasonResults.filter(r => r.events?.is_high_roller)
  const seasonLRResults = seasonResults.filter(r => r.events?.is_low_roller)

  const winVenues = new Set(
    allResults
      .filter(r => r.finish_position === 1 && r.events?.casino)
      .map(r => r.events.casino)
  )

  const cashVenues = [...new Set(
    allResults
      .filter(r => r.events?.casino)
      .map(r => r.events.casino)
  )] as string[]

  const sortedWins = allResults
    .filter(r => r.finish_position === 1 && r.events?.start_date)
    .sort((a, b) => new Date(a.events.start_date).getTime() - new Date(b.events.start_date).getTime())

  const hasBackToBack = sortedWins.length >= 2

  const winsByName = new Map<string, Set<number>>()
  for (const r of allResults.filter(r => r.finish_position === 1)) {
    const name = r.events?.tournament_name?.toLowerCase().trim()
    if (!name) continue
    if (!winsByName.has(name)) winsByName.set(name, new Set())
    winsByName.get(name)!.add(r.season_id)
  }
  const hasRepeatChampion = [...winsByName.values()].some(seasons => seasons.size >= 2)

  const { data: manualBadges } = await supabase
    .from('player_badges')
    .select('badge_key')
    .eq('player_id', playerId)

  return {
    seasonResults,
    seasonHRResults,
    seasonLRResults,
    nplRank,
    lifetimeWins,
    lifetimeCashes,
    lifetimePrizeMoney,
    hasBackToBack,
    hasRepeatChampion,
    uniqueWinVenues: winVenues.size,
    uniqueCashVenues: cashVenues,
    allVenues,
    manualBadges: (manualBadges || []).map(b => b.badge_key),
  }
}