import { supabase } from '@/lib/supabase'
import { getNPLLeaderboard, getHighRollerLeaderboard, getLowRollerLeaderboard, scrubAnonymous } from '@/lib/calculations'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HomeLeaderboard from '@/components/HomeLeaderboard'
import Link from 'next/link'

export const revalidate = 300

export default async function HomePage() {
  const { data: season } = await supabase.from('seasons').select('*').eq('is_active', true).single()
  const seasonId = season?.id || 1

  const [nplBoardRaw, hrBoardRaw, lrBoardRaw, eventsRes, newsRes] = await Promise.all([
    getNPLLeaderboard(seasonId),
    getHighRollerLeaderboard(seasonId),
    getLowRollerLeaderboard(seasonId),
    supabase.from('events').select('*').eq('season_id', seasonId).order('start_date', { ascending: false }).limit(4),
    supabase.from('news').select('*').order('published_at', { ascending: false }).limit(4),
  ])

  // Scrub non-GDPR data BEFORE passing to client component
  const nplBoard = scrubAnonymous(nplBoardRaw)
  const hrBoard = scrubAnonymous(hrBoardRaw)
  const lrBoard = scrubAnonymous(lrBoardRaw)

  const events = eventsRes.data || []
  const news = newsRes.data || []

  return (
    <div className="min-h-screen bg-[#040408] text-white flex flex-col font-sans relative overflow-hidden">
      
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 casino-grid opacity-40"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-[150px] animate-float mix-blend-screen"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[40vw] h-[40vw] bg-purple-600/20 rounded-full blur-[150px] animate-float-delayed mix-blend-screen"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <section className="relative min-h-[550px] flex items-center justify-center border-b border-white/10 mb-12 shadow-[0_10px_50px_rgba(0,0,0,0.5)]">
          
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[url(/hero.jpg)] bg-cover bg-[center_35%] opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#040408]/90 via-[#040408]/20 to-[#040408]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#040408]/80 via-transparent to-[#040408]/80" />
          </div>

          <div className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-gradient-to-r from-blue-600/40 via-cyan-400/30 to-purple-600/40 blur-[100px] pointer-events-none mix-blend-screen" />

          <div className="relative z-20 text-center max-w-5xl px-6 py-12 mt-6">
            <div className="flex justify-center items-center gap-4 mb-8">
              <span className="h-[2px] w-12 bg-gradient-to-r from-transparent to-cyan-400"></span>
              <span className="text-cyan-400 text-[10px] tracking-[5px] uppercase font-black px-5 py-1.5 rounded-full border border-cyan-400/40 bg-[#040408]/80 backdrop-blur-md shadow-[0_0_15px_rgba(0,243,255,0.2)]">
                {season?.name || '2026 Season'} • LIVE
              </span>
              <span className="h-[2px] w-12 bg-gradient-to-l from-transparent to-cyan-400"></span>
            </div>

            <h1 className="flex flex-col items-center justify-center font-black italic uppercase leading-none mb-8 drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]">
              <span className="text-4xl md:text-5xl text-white">Where</span>
              <span className="text-7xl md:text-8xl lg:text-[140px] text-gold-gradient py-2 filter drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]">Champions</span>
              <span className="text-4xl md:text-5xl text-white">Are Made</span>
            </h1>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link href="/leaderboard" className="relative group px-10 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black rounded-xl transition-all uppercase tracking-widest text-[11px] overflow-hidden">
                <span className="absolute inset-0 w-full h-full bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 -translate-x-full"></span>
                <span className="relative z-10 shadow-lg">Live Standings</span>
              </Link>
              <Link href="/events" className="px-10 py-4 bg-[#040408]/50 border border-white/20 text-white font-bold rounded-xl hover:bg-white/10 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(0,243,255,0.2)] transition-all uppercase tracking-widest text-[11px] backdrop-blur-md">
                View Schedule
              </Link>
            </div>

            <div className="flex justify-center items-center pt-8">
              {[
                { value: '1,670', label: 'Active Players', color: 'from-cyan-400 to-blue-500' },
                { value: '77', label: 'Events Played', color: 'from-purple-400 to-pink-500' },
                { value: '£2.6M', label: 'Prize Money', color: 'from-yellow-400 to-amber-600' },
              ].map((stat, i) => (
                <div key={i} className={`text-center px-8 md:px-16 ${i !== 2 ? 'border-r border-white/10' : ''}`}>
                  <div className={`text-4xl md:text-6xl font-black mb-2 bg-gradient-to-br ${stat.color} text-transparent bg-clip-text drop-shadow-md`}>
                    {stat.value}
                  </div>
                  <div className="text-[10px] text-white/50 tracking-[3px] uppercase font-bold">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 md:px-12 pb-24">
          
          <section className="mb-16">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-[11px] font-black tracking-[5px] text-cyan-400 uppercase mb-2 drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]">Current Standings</h2>
                <h3 className="text-4xl md:text-5xl font-black uppercase italic tracking-tight">The Power Rankings</h3>
              </div>
            </div>
            <HomeLeaderboard npl={nplBoard.slice(0, 8)} hr={hrBoard.slice(0, 8)} lr={lrBoard.slice(0, 8)} />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="glass-panel p-8 rounded-3xl h-full border-t border-t-white/10">
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <span className="text-[11px] font-black text-white/60 tracking-[4px] uppercase">Recent Events</span>
              </div>
              <div className="flex flex-col gap-4">
                {events.map(event => (
                  <Link key={event.id} href={`/events/${event.id}`} className="group relative bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-cyan-500/50 transition-all overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <h4 className="text-sm font-bold text-white mb-2 relative z-10">{event.tournament_name}</h4>
                    <div className="flex justify-between items-center text-xs font-mono relative z-10">
                      <span className="text-white/40">{event.start_date ? new Date(event.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''}</span>
                      <span className="text-cyan-400 font-bold bg-cyan-400/10 px-3 py-1 rounded-md">£{Number(event.buy_in).toLocaleString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="glass-panel p-8 rounded-3xl h-full border-t border-t-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none"></div>
              <span className="block text-[11px] font-black text-white/60 tracking-[4px] uppercase mb-8 border-b border-white/10 pb-4 relative z-10">The Leagues</span>
              {[
                { name: 'National Poker League', rule: 'Top 20 + 2pts extra', color: 'bg-cyan-500', glow: 'shadow-[0_0_15px_rgba(0,243,255,0.4)]' },
                { name: 'High Roller', rule: 'Uncapped points', color: 'bg-[#e8c870]', glow: 'shadow-[0_0_15px_rgba(232,200,112,0.4)]' },
                { name: 'Low Roller', rule: 'Buy-in ≤ £300', color: 'bg-[#60c890]', glow: 'shadow-[0_0_15px_rgba(96,200,144,0.4)]' },
              ].map(league => (
                <div key={league.name} className="relative bg-black/40 p-5 rounded-2xl mb-4 border border-white/5 pl-6 z-10 hover:bg-white/5 transition-colors">
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${league.color} ${league.glow}`}></div>
                  <h4 className="text-sm font-bold text-white mb-1.5">{league.name}</h4>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{league.rule}</p>
                </div>
              ))}
            </div>

            <div className="glass-panel p-8 rounded-3xl h-full border-t border-t-white/10">
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <span className="text-[11px] font-black text-white/60 tracking-[4px] uppercase">The Wire</span>
              </div>
              <div className="flex flex-col gap-6">
                {news.map((item: any) => (
                  <div key={item.id} className="group relative pl-4 border-l-2 border-white/10 hover:border-purple-500 transition-colors">
                    <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_rgba(157,0,255,0.8)]"></div>
                    <div className="text-[9px] text-purple-400 tracking-[3px] uppercase font-black mb-1.5">
                      {new Date(item.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="text-sm text-white/90 font-medium leading-snug group-hover:text-white transition-colors">{item.title}</div>
                  </div>
                ))}
              </div>
            </div>

          </section>
        </main>
        <Footer />
      </div>
    </div>
  )
}