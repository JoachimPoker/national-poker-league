import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const revalidate = 300

const NPL_RULES: Record<string, string> = {
  top20_plus2: 'Top 20 results + 2pts per extra cash',
  top20: 'Top 20 results only',
  all: 'All results counted',
}

export default async function HistoryPage() {
  const { data: seasons } = await supabase
    .from('seasons')
    .select('*')
    .order('year', { ascending: false })

  const allSeasons = seasons || []

  return (
    <div className="min-h-screen bg-[#040408] text-white flex flex-col font-sans relative overflow-hidden">
      
      {/* GLOBAL AMBIENT LIGHTING & GRID */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 casino-grid opacity-40"></div>
        <div className="absolute top-[10%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-600/10 rounded-full blur-[150px] animate-float mix-blend-screen"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[40vw] h-[40vw] bg-purple-600/10 rounded-full blur-[150px] animate-float-delayed mix-blend-screen"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        {/* HEADER SECTION */}
        <section className="relative bg-black/40 border-b border-white/10 pt-16 pb-12 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <div className="flex items-center gap-4 mb-6">
              <span className="h-[2px] w-8 bg-gradient-to-r from-transparent to-cyan-400"></span>
              <span className="text-cyan-400 text-[10px] tracking-[5px] uppercase font-black">
                National Poker League
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mb-4 drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
              The <span className="text-gold-gradient drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">Archives</span>
            </h1>
            <p className="text-white/50 text-sm md:text-base max-w-2xl font-medium mb-4">
              Explore the legacy of past seasons, review historical leaderboards, and access the complete vault of previous circuit results.
            </p>
          </div>
        </section>

        {/* MAIN CONTENT */}
        <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 md:px-12 py-16">
          {allSeasons.length === 0 ? (
            <div className="glass-panel p-16 text-center text-white/30 font-bold uppercase tracking-widest text-sm rounded-3xl border-dashed border-2 border-white/10">
              No historical seasons in the vault yet.
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {allSeasons.map(season => (
                <SeasonCard key={season.id} season={season} />
              ))}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  )
}

async function SeasonCard({ season }: { season: any }) {
  const [eventsRes, resultsRes] = await Promise.all([
    supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('season_id', season.id),
    supabase
      .from('results')
      .select('player_id')
      .eq('season_id', season.id),
  ])

  const eventCount = eventsRes.count || 0
  const uniquePlayers = new Set((resultsRes.data || []).map((r: any) => r.player_id)).size
  const ruleLabel = NPL_RULES[season.npl_rule] || season.npl_rule

  return (
    <div className={`group relative glass-panel rounded-3xl p-8 md:p-10 overflow-hidden transition-all duration-500 hover:-translate-y-1 ${
      season.is_active 
        ? 'border-[#D4AF37]/50 shadow-[0_15px_40px_rgba(212,175,55,0.15)] bg-gradient-to-br from-[#0A0A10] to-[#1A1500]' 
        : 'hover:border-cyan-500/50 hover:shadow-[0_15px_40px_rgba(0,243,255,0.1)] bg-black/40'
    }`}>
      
      {/* Background Glow Effects */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500 ${
        season.is_active ? 'bg-gradient-to-b from-[#D4AF37] to-[#FBF091]' : 'bg-white/10 group-hover:bg-gradient-to-b group-hover:from-cyan-400 group-hover:to-blue-600'
      }`}></div>
      {season.is_active && (
        <div className="absolute top-[-50%] right-[-10%] w-[100%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_50%)] animate-pulse pointer-events-none" />
      )}

      {/* Active Season Badge */}
      {season.is_active && (
        <div className="absolute top-6 right-6 md:top-8 md:right-8 bg-[#D4AF37]/10 text-[#FBF091] border border-[#D4AF37]/40 text-[9px] tracking-[3px] uppercase px-4 py-1.5 rounded-full font-black shadow-[0_0_15px_rgba(212,175,55,0.3)] backdrop-blur-md">
          Current Season
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12 relative z-10">
        
        {/* Year & Title */}
        <div className="flex-shrink-0 pt-6 md:pt-0">
          <div className={`text-6xl md:text-7xl font-black italic tracking-tighter leading-none mb-2 transition-colors duration-500 ${
            season.is_active ? 'text-gold-gradient drop-shadow-md' : 'text-white/20 group-hover:text-white/40'
          }`}>
            {season.year}
          </div>
          <div className="text-sm text-white/60 font-bold uppercase tracking-widest">
            {season.name}
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-[1px] h-24 bg-white/10 transition-colors group-hover:bg-white/20" />
        <div className="md:hidden w-full h-[1px] bg-white/10" />

        {/* Stats & Links */}
        <div className="flex-1 flex flex-col justify-between">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {[
              { label: 'Events Played', value: eventCount },
              { label: 'Active Players', value: uniquePlayers },
              { label: 'Rule Set', value: ruleLabel, textClass: 'text-sm' },
            ].map((stat, idx) => (
              <div key={stat.label} className={idx === 2 ? 'sm:col-span-1' : ''}>
                <div className="text-[10px] text-white/40 tracking-[2px] uppercase font-bold mb-1.5">
                  {stat.label}
                </div>
                <div className={`font-black text-white ${stat.textClass || 'text-2xl'}`}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4">
            <Link 
              href={`/leaderboard?season=${season.id}`} 
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${
                season.is_active 
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#8B6914] text-black hover:scale-105 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]' 
                  : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:scale-105 hover:shadow-[0_0_20px_rgba(0,243,255,0.3)]'
              }`}
            >
              View Leaderboard
            </Link>
            <Link 
              href={`/events?season=${season.id}`} 
              className="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/60 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
            >
              View Events
            </Link>
          </div>
          
        </div>
      </div>
    </div>
  )
}