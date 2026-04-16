import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 300

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const eventId = parseInt(id)

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single()

  if (!event) notFound()

  const { data: results } = await supabase
    .from('results')
    .select('*, players(full_name, gdpr, home_casino)')
    .eq('event_id', eventId)
    .order('finish_position', { ascending: true })

  const allResults = results || []
  const totalPrizeMoney = allResults.reduce((sum, r) => sum + (r.prize_amount || 0), 0)
  const winner = allResults.find(r => r.finish_position === 1)

  // Neon Badge Theme Mapping
  const theme = event.is_high_roller 
    ? { color: 'text-amber-400', border: 'border-amber-400/30', bg: 'bg-amber-400/10', glow: 'shadow-[0_0_15px_rgba(251,191,36,0.3)]', label: 'High Roller', statGradient: 'from-amber-400 to-yellow-600' }
    : event.is_low_roller 
    ? { color: 'text-emerald-400', border: 'border-emerald-400/30', bg: 'bg-emerald-400/10', glow: 'shadow-[0_0_15px_rgba(52,211,153,0.3)]', label: 'Low Roller', statGradient: 'from-emerald-400 to-green-600' }
    : { color: 'text-cyan-400', border: 'border-cyan-400/30', bg: 'bg-cyan-400/10', glow: 'shadow-[0_0_15px_rgba(34,211,238,0.3)]', label: 'Main Event', statGradient: 'from-cyan-400 to-blue-500' }

  return (
    <div className="min-h-screen bg-[#040408] text-white flex flex-col font-sans relative overflow-hidden">
      
      {/* GLOBAL AMBIENT LIGHTING & GRID */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 casino-grid opacity-40"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-[150px] animate-float mix-blend-screen"></div>
        <div className="absolute bottom-[20%] left-[-10%] w-[40vw] h-[40vw] bg-purple-600/20 rounded-full blur-[150px] animate-float-delayed mix-blend-screen"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        {/* HEADER SECTION */}
        <section className="relative bg-black/40 border-b border-white/10 pt-10 pb-12 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            
            <Link href="/events" className="group inline-flex items-center gap-2 text-[10px] text-white/40 hover:text-cyan-400 font-bold uppercase tracking-widest mb-8 transition-colors">
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Circuit
            </Link>

            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <span className={`text-[9px] font-black tracking-widest uppercase px-3 py-1.5 rounded-lg border ${theme.border} ${theme.bg} ${theme.color} ${theme.glow} inline-block w-max`}>
                {theme.label}
              </span>
              <span className="text-sm font-mono text-white/50 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span> {event.casino}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black italic tracking-tighter uppercase mb-6 drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] leading-none max-w-4xl">
              {event.tournament_name}
            </h1>
            
            <p className="text-white/50 text-sm md:text-base font-medium mb-12 flex items-center gap-3">
              📅 {event.start_date ? new Date(event.start_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Date TBD'}
            </p>

            {/* Neon Stats */}
            <div className="grid grid-cols-2 md:flex md:gap-16 gap-y-8 pt-8 border-t border-white/10">
              {[
                { label: 'Buy-in', value: `£${Number(event.buy_in).toLocaleString()}`, color: theme.statGradient },
                { label: 'Total Entries', value: allResults.length, color: 'from-white to-gray-400' },
                { label: 'Prize Pool', value: `£${totalPrizeMoney.toLocaleString()}`, color: 'from-amber-400 to-yellow-600' },
                { label: 'Winner', value: winner?.players?.gdpr ? (winner.players as any).full_name : 'Anonymous', color: 'from-purple-400 to-pink-500', truncate: true },
              ].map((stat) => (
                <div key={stat.label} className={stat.truncate ? "col-span-2 md:col-span-1" : ""}>
                  <div className={`text-3xl md:text-4xl font-black mb-1 bg-gradient-to-br ${stat.color} text-transparent bg-clip-text drop-shadow-md ${stat.truncate ? "truncate max-w-[300px]" : ""}`}>
                    {stat.value}
                  </div>
                  <div className="text-[9px] text-white/40 tracking-[3px] uppercase font-bold">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MAIN CONTENT */}
        <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 md:px-12 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">

            {/* RESULTS TABLE */}
            <div>
              <div className="flex justify-between items-end mb-8">
                <h2 className="text-[12px] font-black text-white/80 tracking-[4px] uppercase drop-shadow-md">
                  Vault Records
                </h2>
                <span className="text-[10px] uppercase tracking-widest font-bold text-white/30">
                  {allResults.length} Players Cashed
                </span>
              </div>

              <div className="glass-panel rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t border-white/10">
                
                {/* Desktop Header */}
                <div className="hidden md:grid grid-cols-[80px_1fr_100px_120px] gap-4 p-6 border-b border-white/10 bg-white/5 text-[9px] uppercase tracking-[3px] font-black text-white/40">
                  <div className="text-center">Finish</div>
                  <div>Player</div>
                  <div className="text-right">Points</div>
                  <div className="text-right pr-4">Prize</div>
                </div>

                <div className="bg-black/50 backdrop-blur-xl">
                  {allResults.map((result, index) => {
                    const player = result.players as any
                    const isWinner = result.finish_position === 1
                    
                    return (
                      <div 
                        key={result.id} 
                        className={`group flex flex-col md:grid md:grid-cols-[80px_1fr_100px_120px] gap-4 p-5 md:items-center border-b border-white/5 last:border-0 hover:bg-gradient-to-r hover:from-white/5 hover:to-transparent transition-all relative ${
                          isWinner ? 'bg-gradient-to-r from-[#D4AF37]/10 to-transparent' : ''
                        }`}
                      >
                        {/* Hover & Winner Glow Edges */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b ${theme.statGradient}`}></div>
                        {isWinner && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#D4AF37] to-[#FBF091] shadow-[0_0_15px_rgba(212,175,55,0.6)]"></div>}

                        {/* Finish Position */}
                        <div className="flex items-center gap-4 md:justify-center pl-2 md:pl-0 mb-2 md:mb-0">
                          <span className={`font-black italic transition-all ${
                            isWinner ? 'text-gold-gradient drop-shadow-[0_0_10px_rgba(212,175,55,0.4)] text-4xl' : 'text-white/30 group-hover:text-white/50 text-2xl'
                          }`}>
                            {result.finish_position}<span className="text-sm">{ordinal(result.finish_position)}</span>
                          </span>
                        </div>

                        {/* Player Details */}
                        <div className="pl-2 md:pl-0 flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black border shadow-md ${
                            isWinner ? 'bg-[#D4AF37]/20 text-[#FBF091] border-[#D4AF37]/40 shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'bg-white/5 text-white/60 border-white/10'
                          }`}>
                            {player?.gdpr ? player.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : '—'}
                          </div>
                          <div>
                            {player?.gdpr ? (
                              <Link href={`/players/${result.player_id}`} className={`font-black tracking-tight hover:text-cyan-400 transition-colors block ${
                                isWinner ? 'text-xl text-white drop-shadow-md' : 'text-[15px] text-white/90 group-hover:text-white'
                              }`}>
                                {player.full_name}
                              </Link>
                            ) : (
                              <span className="font-bold italic text-[15px] text-white/40 block">Anonymous Player</span>
                            )}
                            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                              {player?.gdpr ? player.home_casino : 'Location Unknown'}
                            </span>
                          </div>
                        </div>

                        {/* Points */}
                        <div className="flex justify-between items-center md:justify-end w-full pl-2 md:pl-0 mt-2 md:mt-0">
                          <span className="md:hidden text-[10px] text-white/40 uppercase tracking-widest font-bold">Points</span>
                          <span className={`font-mono font-black ${
                            isWinner ? 'text-xl text-white bg-white/10 px-3 py-1 rounded-lg border border-white/10' : 'text-lg text-white/80'
                          }`}>
                            {result.points.toFixed(2)}
                          </span>
                        </div>

                        {/* Prize */}
                        <div className="flex justify-between items-center md:justify-end w-full md:pr-4 pl-2 md:pl-0">
                          <span className="md:hidden text-[10px] text-white/40 uppercase tracking-widest font-bold">Prize</span>
                          <span className={`font-black ${
                            result.prize_amount > 0 
                              ? isWinner ? 'text-2xl text-gold-gradient drop-shadow-md' : 'text-lg text-emerald-400'
                              : 'text-white/20 italic text-sm'
                          }`}>
                            {result.prize_amount > 0 ? `£${result.prize_amount.toLocaleString()}` : '—'}
                          </span>
                        </div>

                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* SIDEBAR */}
            <div className="flex flex-col gap-8">
              
              {/* Event Details Card */}
              <div className="glass-panel p-8 rounded-3xl border-t border-t-white/10">
                <span className="block text-[11px] font-black text-white/60 tracking-[4px] uppercase mb-6 border-b border-white/10 pb-4">
                  Event Details
                </span>
                <div className="flex flex-col gap-4">
                  {[
                    { label: 'Venue', value: event.casino },
                    { label: 'Date', value: event.start_date ? new Date(event.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                    { label: 'Buy-in', value: `£${Number(event.buy_in).toLocaleString()}` },
                    { label: 'Entries', value: allResults.length },
                    { label: 'Prize Pool', value: `£${totalPrizeMoney.toLocaleString()}` },
                    { label: 'Type', value: theme.label },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center pb-4 border-b border-white/5 last:border-0 last:pb-0">
                      <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{item.label}</span>
                      <span className="text-sm text-white font-bold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prize Breakdown Card */}
              {totalPrizeMoney > 0 && (
                <div className="glass-panel p-8 rounded-3xl border-t border-t-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 blur-[60px] rounded-full pointer-events-none"></div>
                  
                  <span className="block text-[11px] font-black text-amber-400/80 tracking-[4px] uppercase mb-6 border-b border-white/10 pb-4 relative z-10">
                    Prize Distribution
                  </span>
                  
                  <div className="flex flex-col gap-4 relative z-10">
                    {allResults.filter(r => r.prize_amount > 0).map((result, idx) => {
                      const player = result.players as any
                      const isWinner = result.finish_position === 1
                      
                      return (
                        <div key={result.id} className="flex justify-between items-center pb-4 border-b border-white/5 last:border-0 last:pb-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-black italic ${isWinner ? 'text-amber-400 text-lg' : 'text-white/40 text-sm'}`}>
                              {result.finish_position}{ordinal(result.finish_position)}
                            </span>
                            <span className={`text-xs font-bold truncate max-w-[100px] ${isWinner ? 'text-white' : 'text-white/60'}`}>
                              {player?.gdpr ? player.full_name.split(' ')[0] : 'Anon'}
                            </span>
                          </div>
                          <div className={`font-black ${isWinner ? 'text-amber-400 text-lg drop-shadow-sm' : 'text-emerald-400 text-sm'}`}>
                            £{result.prize_amount.toLocaleString()}
                          </div>
                        </div>
                      )
                    })}
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