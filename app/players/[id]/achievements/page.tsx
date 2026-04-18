import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBadgeDefinitionsServer } from '@/lib/badge-server'
import { calculateBadges, type PlayerStats, TIER_COLORS } from '@/lib/badge-definitions'

export const revalidate = 300

export default async function PlayerAchievementsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const playerId = parseInt(id)

  // Fetch player
  const { data: player } = await supabase
    .from('players')
    .select('*')
    .eq('id', playerId)
    .single()

  if (!player || !player.gdpr) notFound()

  // Fetch ALL results for badge calculation
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

  // Calculate stats for badges
  const lifetimeWins = allResults.filter(r => r.finish_position === 1).length
  const lifetimeCashes = allResults.filter(r => r.prize_amount > 0).length
  const lifetimeEventsPlayed = new Set(allResults.map(r => r.event_id)).size
  const lifetimePrizeMoney = allResults.reduce((sum, r) => sum + (r.prize_amount || 0), 0)
  const lifetimeFinalTables = allResults.filter(r => r.finish_position <= 9 && r.finish_position > 0).length

  const hrResults = allResults.filter(r => r.events?.is_high_roller)
  const lrResults = allResults.filter(r => r.events?.is_low_roller)

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

  const winVenueCounts = new Map<string, number>()
  wins.forEach(w => {
    const venue = w.events?.casino
    if (venue) winVenueCounts.set(venue, (winVenueCounts.get(venue) || 0) + 1)
  })
  const hasRepeatChampion = Array.from(winVenueCounts.values()).some(count => count >= 2)

  const uniqueWinVenues = new Set(wins.map(w => w.events?.casino).filter(Boolean)).size
  const uniqueCashVenues = [...new Set(
    allResults.filter(r => r.prize_amount > 0).map(r => r.events?.casino).filter(Boolean)
  )] as string[]

  const { data: allVenueData } = await supabase.from('events').select('casino')
  const allVenues = [...new Set((allVenueData || []).map((e: any) => e.casino).filter(Boolean))] as string[]

  const { data: manualBadges } = await supabase
    .from('player_badges')
    .select('badge_key')
    .eq('player_id', playerId)
    .eq('awarded_by', 'Manual')
  
  const manualBadgeKeys = manualBadges?.map(b => b.badge_key) || []

  const { data: seasons } = await supabase.from('seasons').select('*')
  const currentSeason = seasons?.find(s => s.is_active)
  const currentSeasonResults = allResults.filter(r => r.season_id === currentSeason?.id)

  const { data: allPlayers } = await supabase
    .from('players')
    .select('id, lifetime_wins, lifetime_cashes, lifetime_money_won')
    .eq('gdpr', true)

  const rankedPlayers = (allPlayers || [])
    .map(p => ({
      ...p,
      score: (p.lifetime_wins || 0) * 1000 + (p.lifetime_cashes || 0) * 10 + (p.lifetime_money_won || 0) * 0.001
    }))
    .sort((a, b) => b.score - a.score)

  const careerRank = rankedPlayers.findIndex(p => p.id === playerId) + 1

  const playerStats: PlayerStats = {
    seasonResults: currentSeasonResults,
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

  const earnedBadges = badges.filter(b => b.earned)
  const totalBadges = badges.length
  const completionRate = Math.round((earnedBadges.length / totalBadges) * 100)

  // Group by category
  const categories = ['Wins', 'Cashes', 'Money', 'Final Tables', 'Events Played', 'Special']
  const categoryIcons: Record<string, string> = {
    'Wins': '🏆',
    'Cashes': '💰',
    'Money': '💵',
    'Final Tables': '🎖️',
    'Events Played': '🎯',
    'Special': '⭐'
  }

  return (
    <div className="min-h-screen bg-[#040408] text-white flex flex-col font-sans relative overflow-hidden">
      
      {/* GLOBAL AMBIENT LIGHTING & GRID */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 casino-grid opacity-40"></div>
        <div className="absolute top-[0%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[150px] animate-float mix-blend-screen"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[40vw] h-[40vw] bg-blue-600/10 rounded-full blur-[150px] animate-float-delayed mix-blend-screen"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        {/* HEADER */}
        <section className="relative bg-black/40 border-b border-white/10 pt-10 pb-12 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="max-w-[1200px] mx-auto px-6 md:px-12">
            
            <Link href={`/players/${playerId}`} className="group inline-flex items-center gap-2 text-[10px] text-white/40 hover:text-cyan-400 font-bold uppercase tracking-widest mb-8 transition-colors">
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Profile
            </Link>

            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black border-4 bg-gradient-to-br from-purple-500/20 to-blue-600/10 text-purple-400 border-purple-400/50 shadow-xl">
                {player.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </div>

              {/* Title */}
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-2 drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] leading-none">
                  {player.full_name}'s Achievements
                </h1>
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="text-sm text-white/60">
                    <span className="font-black text-white">{earnedBadges.length}</span> of {totalBadges} earned
                  </div>
                  <div className="text-sm text-cyan-400 font-black">
                    {completionRate}% Complete
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* MAIN CONTENT */}
        <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 md:px-12 py-12">
          
          {categories.map(category => {
            const categoryBadges = badges.filter(b => b.category === category)
            if (categoryBadges.length === 0) return null
            
            const earnedCount = categoryBadges.filter(b => b.earned).length
            const categoryProgress = Math.round((earnedCount / categoryBadges.length) * 100)

            return (
              <div key={category} className="mb-12">
                {/* Category Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{categoryIcons[category]}</span>
                    <div>
                      <h2 className="text-2xl font-black text-white uppercase tracking-wider">
                        {category}
                      </h2>
                      <p className="text-sm text-white/40 uppercase tracking-widest font-bold mt-1">
                        {earnedCount} of {categoryBadges.length} earned
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress */}
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-3 bg-black/60 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${categoryProgress}%` }}
                      />
                    </div>
                    <span className="text-xl font-black text-cyan-400 min-w-[4ch] text-right">
                      {categoryProgress}%
                    </span>
                  </div>
                </div>

                {/* Badges Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {categoryBadges.map(badge => {
                    const colors = TIER_COLORS[badge.tier] || TIER_COLORS.bronze
                    const dim = !badge.earned

                    return (
                      <div
                        key={badge.key}
                        className={`relative flex flex-col items-center p-4 rounded-xl border backdrop-blur-md transition-all ${
                          dim 
                            ? 'bg-black/40 border-white/5 opacity-40 hover:opacity-70' 
                            : 'hover:-translate-y-2 hover:shadow-2xl'
                        }`}
                        style={{
                          backgroundColor: dim ? undefined : colors.bg,
                          borderColor: dim ? undefined : colors.border,
                          boxShadow: dim ? undefined : `0 0 15px ${colors.bg}`
                        }}
                        title={badge.desc}
                      >
                        {/* Icon */}
                        <div 
                          className="text-4xl mb-3"
                          style={{ filter: dim ? 'grayscale(100%)' : 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))' }}
                        >
                          {badge.icon}
                        </div>
                        
                        {/* Name */}
                        <div 
                          className="text-[10px] font-black text-center leading-tight mb-2 uppercase tracking-wider"
                          style={{ color: badge.earned ? colors.color : 'rgba(255,255,255,0.3)' }}
                        >
                          {badge.name}
                        </div>

                        {/* Description */}
                        <div className="text-[8px] text-white/40 text-center leading-tight line-clamp-2">
                          {badge.desc}
                        </div>

                        {/* Progress for unearned */}
                        {!badge.earned && badge.progress !== undefined && badge.progress > 0 && (
                          <div className="w-full mt-3">
                            <div className="h-1.5 bg-black/60 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all"
                                style={{ 
                                  width: `${badge.progress}%`, 
                                  backgroundColor: colors.color,
                                }}
                              />
                            </div>
                            <div className="text-[8px] text-white/40 text-center mt-1 font-bold">
                              {badge.progress}%
                            </div>
                          </div>
                        )}

                        {/* Checkmark */}
                        {badge.earned && (
                          <div 
                            className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center border-2 shadow-lg"
                            style={{
                              backgroundColor: colors.color,
                              borderColor: colors.border,
                            }}
                          >
                            <span className="text-black text-sm font-black">✓</span>
                          </div>
                        )}
                        
                        {/* Tier Badge */}
                        {badge.earned && (
                          <div 
                            className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded text-[7px] font-black uppercase tracking-widest border shadow-lg"
                            style={{
                              backgroundColor: colors.bg,
                              borderColor: colors.border,
                              color: colors.color,
                            }}
                          >
                            {badge.tier}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

        </main>

        <Footer />
      </div>
    </div>
  )
}