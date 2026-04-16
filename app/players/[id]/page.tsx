import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getNPLLeaderboard } from '@/lib/calculations'
import { getPlayerLifetimeStats } from '@/lib/badges'
import { calculateBadges } from '@/lib/badge-definitions'
import BadgeGrid from '@/components/BadgeComponents'

export const revalidate = 300

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const playerId = parseInt(id)

  const { data: player } = await supabase
    .from('players')
    .select('*')
    .eq('id', playerId)
    .single()

  if (!player || !player.gdpr) notFound()

  const { data: season } = await supabase
    .from('seasons')
    .select('*')
    .eq('is_active', true)
    .single()

  const seasonId = season?.id || 1

  // Current season results
  let seasonResults: any[] = []
  let from = 0
  while (true) {
    const { data } = await supabase
      .from('results')
      .select('*, events(*)')
      .eq('player_id', playerId)
      .eq('season_id', seasonId)
      .range(from, from + 999)
    if (!data || data.length === 0) break
    seasonResults = seasonResults.concat(data)
    if (data.length < 1000) break
    from += 1000
  }

  seasonResults = seasonResults.sort((a, b) =>
    new Date(b.events?.start_date || 0).getTime() - new Date(a.events?.start_date || 0).getTime()
  )

  // NPL points calculation
  const allPoints = seasonResults.map(r => r.points).sort((a, b) => b - a)
  const top20 = allPoints.slice(0, 20)
  const extraResults = Math.max(0, allPoints.length - 20)
  const nplPoints = top20.reduce((sum, p) => sum + p, 0) + extraResults * 2

  // League breakdowns
  const hrResults = seasonResults.filter(r => r.events?.is_high_roller)
  const hrPoints = hrResults.reduce((sum, r) => sum + r.points, 0)
  const lrResults = seasonResults.filter(r => r.events?.is_low_roller)
  const lrPoints = lrResults.reduce((sum, r) => sum + r.points, 0)

  // Stats
  const totalPrizeMoney = seasonResults.reduce((sum, r) => sum + (r.prize_amount || 0), 0)
  const bestFinish = seasonResults.length > 0
    ? Math.min(...seasonResults.map(r => r.finish_position).filter(p => p > 0))
    : 0

  // NPL rank
  const nplLeaderboard = await getNPLLeaderboard(seasonId)
  const nplRank = nplLeaderboard.findIndex(e => e.player_id === playerId) + 1
  const isFirst = nplRank === 1

  // All venues for explorer badge
  const { data: allVenueData } = await supabase
    .from('events')
    .select('casino')
    .eq('season_id', seasonId)
  const allVenues = [...new Set((allVenueData || []).map((e: any) => e.casino).filter(Boolean))] as string[]

  // Badges
  const lifetimeStats = await getPlayerLifetimeStats(playerId, seasonId, nplRank, allVenues)
  const badges = calculateBadges(lifetimeStats)

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

        {/* 1. FULL WIDTH HEADER */}
        <section className="relative bg-black/40 border-b border-white/10 pt-10 pb-12 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            
            <Link href="/players" className="group inline-flex items-center gap-2 text-[10px] text-white/40 hover:text-cyan-400 font-bold uppercase tracking-widest mb-8 transition-colors">
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Directory
            </Link>

            <div className="flex flex-col md:flex-row md:items-center gap-6 lg:gap-10">
              
              {/* Neon Avatar */}
              <div className="relative">
                {isFirst && <div className="absolute inset-0 bg-[#D4AF37] blur-[20px] rounded-full opacity-40 animate-pulse"></div>}
                <div className={`relative w-24 h-24 md:w-28 md:h-28 rounded-full flex-shrink-0 flex items-center justify-center text-3xl font-black border-4 shadow-xl z-10 ${
                  isFirst 
                    ? 'bg-gradient-to-br from-[#D4AF37]/30 to-[#FBF091]/10 text-[#FBF091] border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.4)]' 
                    : 'bg-gradient-to-br from-cyan-500/20 to-blue-600/10 text-cyan-400 border-cyan-400/50 shadow-[0_0_30px_rgba(0,243,255,0.2)]'
                }`}>
                  {player.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
              </div>

              {/* Player Details */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <span className="h-[2px] w-6 bg-gradient-to-r from-transparent to-cyan-400"></span>
                  <span className="text-cyan-400 text-[10px] tracking-[4px] uppercase font-black">
                    Contender Profile · {season?.name}
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-black italic tracking-tighter uppercase mb-2 drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] leading-none">
                  {player.full_name}
                </h1>
                <div className="text-white/50 text-sm md:text-base font-mono uppercase tracking-widest">
                  {player.home_casino || 'Independent'}
                </div>
              </div>

              {/* NPL Rank Badge */}
              {nplRank > 0 && (
                <div className="text-left md:text-center flex-shrink-0 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
                  {isFirst && <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/20 blur-[30px] rounded-full"></div>}
                  <div className="text-[10px] text-white/50 uppercase tracking-[3px] font-black mb-1 relative z-10">
                    Current Rank
                  </div>
                  <div className={`text-5xl md:text-6xl font-black italic relative z-10 ${isFirst ? 'text-gold-gradient drop-shadow-md' : 'text-white'}`}>
                    #{nplRank}
                  </div>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* 2. MAIN GRID (Sidebar + Content) */}
        <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 md:px-12 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

            {/* LEFT SIDEBAR (1/3 Width) */}
            <div className="lg:col-span-1 flex flex-col gap-8">
              
              {/* Stat Cards (2x2 Grid) */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Total Cashes', value: seasonResults.length, color: 'text-white' },
                  { label: 'NPL Points', value: (Math.round(nplPoints * 100) / 100).toFixed(2), color: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' },
                  { label: 'Prize Money', value: `£${totalPrizeMoney.toLocaleString()}`, color: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' },
                  { label: 'Best Finish', value: bestFinish > 0 ? `${bestFinish}${ordinal(bestFinish)}` : '—', color: bestFinish === 1 ? 'text-[#FBF091] drop-shadow-[0_0_8px_rgba(251,240,145,0.5)]' : 'text-white' },
                ].map((stat, i) => (
                  <div key={stat.label} className="glass-panel rounded-2xl p-5 relative overflow-hidden group hover:border-white/20 transition-all">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-colors"></div>
                    <div className="text-[9px] text-white/40 tracking-[2px] uppercase font-black mb-2 relative z-10">
                      {stat.label}
                    </div>
                    <div className={`text-2xl font-black relative z-10 ${stat.color}`}>
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Circuit Performance */}
              <div className="glass-panel p-6 rounded-3xl relative overflow-hidden border-t border-t-white/10">
                <h3 className="text-[11px] font-black text-white/60 tracking-[4px] uppercase mb-5 border-b border-white/10 pb-3 relative z-10">
                  Circuit Performance
                </h3>
                <div className="flex flex-col gap-3 relative z-10">
                  {[
                    { label: 'National League', points: Math.round(nplPoints * 100) / 100, results: seasonResults.length, border: 'border-cyan-500' },
                    { label: 'High Roller', points: Math.round(hrPoints * 100) / 100, results: hrResults.length, border: 'border-amber-500' },
                    { label: 'Low Roller', points: Math.round(lrPoints * 100) / 100, results: lrResults.length, border: 'border-emerald-500' },
                  ].map(league => (
                    <div key={league.label} className={`relative bg-black/40 border border-white/5 rounded-xl p-4 overflow-hidden`}>
                      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${league.border} opacity-80`}></div>
                      <div className="flex justify-between items-center pl-2">
                        <div>
                          <div className="text-[10px] font-black text-white/80 uppercase tracking-[2px] mb-1">
                            {league.label}
                          </div>
                          <div className="text-xs text-white/40 font-bold uppercase tracking-widest">
                            {league.results} Event{league.results !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className="text-2xl font-black text-white">
                          {league.points.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trophy Cabinet */}
              <div className="glass-panel p-6 rounded-3xl border-t border-t-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[40px] rounded-full pointer-events-none"></div>
                <h3 className="text-[11px] font-black text-white/60 tracking-[4px] uppercase mb-6 border-b border-white/10 pb-3 relative z-10">
                  Trophy Cabinet
                </h3>
                <div className="relative z-10">
                  <BadgeGrid badges={badges} />
                </div>
              </div>

            </div>

            {/* RIGHT MAIN CONTENT (2/3 Width) */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              
              {/* History Table */}
              <div className="flex flex-col w-full">
                <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-4">
                  <h3 className="text-[11px] font-black text-white/60 tracking-[4px] uppercase">
                    Tournament History
                  </h3>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-white/30">
                    {seasonResults.length} Records
                  </span>
                </div>

                <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
                  {/* Desktop Header */}
                  <div className="hidden md:grid grid-cols-[1fr_100px_80px_90px_90px] gap-4 p-5 border-b border-white/10 bg-white/5 text-[9px] uppercase tracking-[3px] font-black text-white/40">
                    <div>Event</div>
                    <div className="text-right">Date</div>
                    <div className="text-right">Finish</div>
                    <div className="text-right">Buy-in</div>
                    <div className="text-right pr-2">Points</div>
                  </div>

                  {/* Body */}
                  <div className="bg-black/50 backdrop-blur-xl">
                    {seasonResults.length === 0 ? (
                      <div className="p-12 text-center text-white/30 font-bold uppercase tracking-widest text-sm">
                        No recorded cashes yet
                      </div>
                    ) : (
                      seasonResults.map((result) => {
                        const isWin = result.finish_position === 1;
                        return (
                          <div key={result.id} className="group flex flex-col md:grid md:grid-cols-[1fr_100px_80px_90px_90px] gap-4 p-5 md:items-center border-b border-white/5 last:border-0 hover:bg-gradient-to-r hover:from-white/5 hover:to-transparent transition-all relative">
                            {/* Hover & Win Glow */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b from-cyan-400 to-blue-600"></div>
                            {isWin && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#D4AF37] to-[#FBF091] shadow-[0_0_10px_rgba(212,175,55,0.5)]"></div>}

                            {/* Event Name & Badges */}
                            <div className="pl-2 md:pl-0">
                              <Link href={`/events/${result.event_id}`} className="text-[13px] font-bold text-white/90 group-hover:text-cyan-400 transition-colors leading-snug block mb-1.5 pr-2">
                                {result.events?.tournament_name}
                              </Link>
                              <div className="flex items-center gap-2">
                                {result.events?.is_high_roller && <span className="text-[8px] uppercase tracking-widest font-black text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 rounded">HR</span>}
                                {result.events?.is_low_roller && <span className="text-[8px] uppercase tracking-widest font-black text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-1.5 py-0.5 rounded">LR</span>}
                                <span className="text-[9px] text-white/40 font-mono tracking-tight">{result.events?.casino}</span>
                              </div>
                            </div>

                            <div className="hidden md:block text-[10px] text-white/40 text-right font-mono">
                              {result.events?.start_date ? new Date(result.events.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                            </div>

                            <div className="flex justify-between items-center md:justify-end pl-2 md:pl-0 mt-2 md:mt-0">
                              <span className="md:hidden text-[10px] text-white/40 uppercase tracking-widest font-bold">Finish</span>
                              <span className={`font-black italic ${isWin ? 'text-2xl text-gold-gradient drop-shadow-sm' : 'text-lg text-white/80'}`}>
                                {result.finish_position}<span className="text-xs">{ordinal(result.finish_position)}</span>
                              </span>
                            </div>

                            <div className="flex justify-between items-center md:justify-end pl-2 md:pl-0">
                              <span className="md:hidden text-[10px] text-white/40 uppercase tracking-widest font-bold">Buy-in</span>
                              <span className="text-xs text-white/60 font-mono">
                                £{Number(result.events?.buy_in || 0).toLocaleString()}
                              </span>
                            </div>

                            <div className="flex justify-between items-center md:justify-end pl-2 md:pl-0 md:pr-2">
                              <span className="md:hidden text-[10px] text-white/40 uppercase tracking-widest font-bold">Points</span>
                              <span className={`font-mono font-black ${isWin ? 'text-xl text-[#FBF091]' : 'text-lg text-white'}`}>
                                {result.points.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Vault Earnings Ledger */}
              {totalPrizeMoney > 0 && (
                <div className="flex flex-col w-full">
                  <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-4 mt-4">
                    <h3 className="text-[11px] font-black text-emerald-400/80 tracking-[4px] uppercase">
                      Vault Earnings
                    </h3>
                  </div>

                  <div className="glass-panel rounded-3xl border-t border-t-white/10 relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none"></div>
                    
                    {/* Ledger Body */}
                    <div className="p-6 relative z-10 bg-black/30">
                      <div className="flex flex-col gap-1">
                        {seasonResults
                          .filter(r => r.prize_amount > 0)
                          .sort((a, b) => b.prize_amount - a.prize_amount)
                          .map(result => (
                            <div key={result.id} className="flex justify-between items-center py-3 border-b border-white/5 border-dashed last:border-0 hover:bg-white/5 transition-colors px-3 rounded-md">
                              <div className="text-[11px] font-mono text-white/60 flex-1 pr-4 truncate tracking-tight">
                                {result.events?.tournament_name?.split(' - ')[0] || result.events?.tournament_name}
                              </div>
                              <div className="text-sm font-black font-mono text-emerald-400/90 flex-shrink-0">
                                £{result.prize_amount.toLocaleString()}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Ledger Footer */}
                    <div className="p-6 relative z-10 bg-[#0A0A10]/90 backdrop-blur-md border-t border-white/10">
                      <div className="flex justify-between items-center px-3">
                        <div className="text-[10px] text-white/40 uppercase tracking-[3px] font-black">
                          Total Winnings
                        </div>
                        <div className="text-2xl font-black font-mono text-white drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                          £{totalPrizeMoney.toLocaleString()}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  )
}

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}