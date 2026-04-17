import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { notFound } from 'next/navigation'
import { getBadgeDefinitionsServer } from '@/lib/badge-server'
import { calculateBadges, type PlayerStats } from '@/lib/badge-definitions'
import PlayerClient from './PlayerClient'

export const revalidate = 300

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const playerId = parseInt(id)

  // Fetch player
  const { data: player } = await supabase
    .from('players')
    .select('*')
    .eq('id', playerId)
    .single()

  if (!player || !player.gdpr) notFound()

  // Fetch ALL results (lifetime)
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

  // Sort by date (most recent first)
  allResults = allResults.sort((a, b) =>
    new Date(b.events?.start_date || 0).getTime() - new Date(a.events?.start_date || 0).getTime()
  )

  // === CAREER STATS ===
  const lifetimeWins = allResults.filter(r => r.finish_position === 1).length
  const lifetimeCashes = allResults.filter(r => r.prize_amount > 0).length
  const lifetimeEventsPlayed = new Set(allResults.map(r => r.event_id)).size
  const lifetimePrizeMoney = allResults.reduce((sum, r) => sum + (r.prize_amount || 0), 0)
  const lifetimeFinalTables = allResults.filter(r => r.finish_position <= 9 && r.finish_position > 0).length
  
  const winRate = lifetimeEventsPlayed > 0 ? ((lifetimeWins / lifetimeEventsPlayed) * 100).toFixed(1) : '0.0'
  
  const bestFinish = allResults.length > 0
    ? Math.min(...allResults.map(r => r.finish_position).filter(p => p > 0))
    : 0

  // Unique venues
  const uniqueCashVenues = [...new Set(
    allResults
      .filter(r => r.prize_amount > 0)
      .map(r => r.events?.casino)
      .filter(Boolean)
  )] as string[]

  const uniqueWinVenues = new Set(
    allResults
      .filter(r => r.finish_position === 1)
      .map(r => r.events?.casino)
      .filter(Boolean)
  ).size

  // Favorite venue (most cashes)
  const venueCashCounts = new Map<string, number>()
  allResults.filter(r => r.prize_amount > 0).forEach(r => {
    const venue = r.events?.casino
    if (venue) venueCashCounts.set(venue, (venueCashCounts.get(venue) || 0) + 1)
  })
  const favoriteVenue = venueCashCounts.size > 0
    ? Array.from(venueCashCounts.entries()).sort((a, b) => b[1] - a[1])[0][0]
    : null

  // Biggest cash
  const biggestCash = allResults.length > 0
    ? Math.max(...allResults.map(r => r.prize_amount || 0))
    : 0

  // === SEASON BREAKDOWN ===
  const { data: seasons } = await supabase
    .from('seasons')
    .select('*')
    .order('year', { ascending: false })

  const seasonStats = seasons?.map(season => {
    const seasonResults = allResults.filter(r => r.season_id === season.id)
    const seasonWins = seasonResults.filter(r => r.finish_position === 1).length
    const seasonCashes = seasonResults.filter(r => r.prize_amount > 0).length
    const seasonMoney = seasonResults.reduce((sum, r) => sum + (r.prize_amount || 0), 0)
    
    // NPL Points calculation
    const allPoints = seasonResults.map(r => r.points).sort((a, b) => b - a)
    const top20 = allPoints.slice(0, 20)
    const extraResults = Math.max(0, allPoints.length - 20)
    const nplPoints = top20.reduce((sum, p) => sum + p, 0) + extraResults * 2

    return {
      season,
      events: seasonResults.length,
      wins: seasonWins,
      cashes: seasonCashes,
      money: seasonMoney,
      points: nplPoints,
      results: seasonResults
    }
  }) || []

  const currentSeason = seasons?.find(s => s.is_active)

  // === CAREER RANK (all-time leaderboard) ===
  const { data: allPlayers } = await supabase
    .from('players')
    .select('id, lifetime_wins, lifetime_cashes, lifetime_money_won, lifetime_events_played')
    .eq('gdpr', true)

  const rankedPlayers = (allPlayers || [])
    .map(p => ({
      ...p,
      score: (p.lifetime_wins || 0) * 1000 + (p.lifetime_cashes || 0) * 10 + (p.lifetime_money_won || 0) * 0.001
    }))
    .sort((a, b) => b.score - a.score)

  const careerRank = rankedPlayers.findIndex(p => p.id === playerId) + 1

  // === BADGES ===
  const hrResults = allResults.filter(r => r.events?.is_high_roller)
  const lrResults = allResults.filter(r => r.events?.is_low_roller)

  // Check for back-to-back wins
  const sortedResults = [...allResults].sort((a, b) => 
    new Date(a.events?.start_date || 0).getTime() - new Date(b.events?.start_date || 0).getTime()
  )
  const wins = sortedResults.filter(r => r.finish_position === 1)
  let hasBackToBack = false
  for (let i = 0; i < wins.length - 1; i++) {
    if (wins[i].events?.casino === wins[i + 1].events?.casino) {
      hasBackToBack = true
      break
    }
  }

  // Check for repeat champion
  const winVenueCounts = new Map<string, number>()
  wins.forEach(w => {
    const venue = w.events?.casino
    if (venue) winVenueCounts.set(venue, (winVenueCounts.get(venue) || 0) + 1)
  })
  const hasRepeatChampion = Array.from(winVenueCounts.values()).some(count => count >= 2)

  const { data: allVenueData } = await supabase
    .from('events')
    .select('casino')
  const allVenues = [...new Set((allVenueData || []).map((e: any) => e.casino).filter(Boolean))] as string[]

  const { data: manualBadges } = await supabase
    .from('player_badges')
    .select('badge_key')
    .eq('player_id', playerId)
    .eq('awarded_by', 'Manual')
  
  const manualBadgeKeys = manualBadges?.map(b => b.badge_key) || []

  const currentSeasonStats = seasonStats.find(s => s.season.id === currentSeason?.id)

  const playerStats: PlayerStats = {
    seasonResults: currentSeasonStats?.results || [],
    seasonHRResults: hrResults.filter(r => r.season_id === currentSeason?.id),
    seasonLRResults: lrResults.filter(r => r.season_id === currentSeason?.id),
    nplRank: careerRank,
    lifetimeWins,
    lifetimeCashes,
    lifetimeEventsPlayed,
    lifetimePrizeMoney,
    hasBackToBack,
    hasRepeatChampion,
    uniqueWinVenues,
    uniqueCashVenues,
    allVenues,
    manualBadges: manualBadgeKeys
  }

  const badgeDefinitions = await getBadgeDefinitionsServer()
  const badges = calculateBadges(playerStats, badgeDefinitions)

  return (
    <div className="min-h-screen bg-[#040408] text-white flex flex-col font-sans relative overflow-hidden">
      
      {/* GLOBAL AMBIENT LIGHTING & GRID */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 casino-grid opacity-40"></div>
        <div className="absolute top-[0%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-600/10 rounded-full blur-[150px] animate-float mix-blend-screen"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[40vw] h-[40vw] bg-blue-600/10 rounded-full blur-[150px] animate-float-delayed mix-blend-screen"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <PlayerClient
          player={player}
          allResults={allResults}
          seasonStats={seasonStats}
          badges={badges}
          careerRank={careerRank}
          lifetimeWins={lifetimeWins}
          lifetimeCashes={lifetimeCashes}
          lifetimeEventsPlayed={lifetimeEventsPlayed}
          lifetimePrizeMoney={lifetimePrizeMoney}
          lifetimeFinalTables={lifetimeFinalTables}
          winRate={winRate}
          bestFinish={bestFinish}
          biggestCash={biggestCash}
          favoriteVenue={favoriteVenue}
        />

        <Footer />
      </div>
    </div>
  )
}