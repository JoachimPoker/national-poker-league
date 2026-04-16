import { supabase } from '@/lib/supabase'
import { getNPLLeaderboard } from '@/lib/calculations'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PlayersClient from './PlayersClient'

export const revalidate = 300

export default async function PlayersPage() {
  const { data: season } = await supabase
    .from('seasons')
    .select('*')
    .eq('is_active', true)
    .single()

  const seasonId = season?.id || 1

  // Get full NPL leaderboard
  const nplBoard = await getNPLLeaderboard(seasonId)

  // Get unique venues for filter dropdown (Only extract from GDPR players to prevent leaking data)
  const venues = [...new Set(
    nplBoard
      .filter(e => e.gdpr && e.home_casino)
      .map(e => e.home_casino)
  )].sort()

  // We now pass the entire board, including Anonymous players
  const players = nplBoard

  return (
    <div className="min-h-screen bg-[#040408] text-white flex flex-col font-sans relative overflow-hidden">
      
      {/* GLOBAL AMBIENT LIGHTING & GRID */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 casino-grid opacity-40"></div>
        <div className="absolute top-[10%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-600/10 rounded-full blur-[150px] animate-float mix-blend-screen"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[40vw] h-[40vw] bg-purple-600/10 rounded-full blur-[150px] animate-float-delayed mix-blend-screen"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        {/* HEADER SECTION */}
        <section className="relative bg-black/40 border-b border-white/10 pt-16 pb-12 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            
            <div className="flex items-center gap-4 mb-6">
              <span className="h-[2px] w-8 bg-gradient-to-r from-transparent to-cyan-400"></span>
              <span className="text-cyan-400 text-[10px] tracking-[5px] uppercase font-black">
                {season?.name || '2026 Season'}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mb-4 drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
              The <span className="text-gold-gradient drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">Roster</span>
            </h1>
            
            <p className="text-white/50 text-sm md:text-base font-medium mb-8 max-w-xl">
              The complete directory of active contenders across the National Poker League circuit. Search, filter, and scout the competition.
            </p>

            {/* Quick Stats */}
            <div className="flex gap-12 pt-8 border-t border-white/10">
              <div>
                <div className="text-4xl font-black mb-1 text-white drop-shadow-md">{players.length}</div>
                <div className="text-[9px] text-white/40 tracking-[3px] uppercase font-bold">Total Players</div>
              </div>
              <div>
                <div className="text-4xl font-black mb-1 bg-gradient-to-br from-cyan-400 to-blue-500 text-transparent bg-clip-text drop-shadow-md">{venues.length}</div>
                <div className="text-[9px] text-white/40 tracking-[3px] uppercase font-bold">Venues Represented</div>
              </div>
            </div>

          </div>
        </section>

        {/* MAIN DIRECTORY APP */}
        <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 md:px-12 py-16">
          <PlayersClient players={players} venues={venues} />
        </main>

        <Footer />
      </div>
    </div>
  )
}