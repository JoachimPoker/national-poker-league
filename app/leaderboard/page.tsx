import { supabase } from '@/lib/supabase'
import { getNPLLeaderboard, getHighRollerLeaderboard, getLowRollerLeaderboard } from '@/lib/calculations'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import LeaderboardClient from './LeaderboardClient'

export const revalidate = 300

export default async function LeaderboardPage() {
  // Fetch current active season
  const { data: season } = await supabase.from('seasons').select('*').eq('is_active', true).single()
  const seasonId = season?.id || 1

  // Fetch all leaderboards concurrently
  const [nplBoard, hrBoard, lrBoard] = await Promise.all([
    getNPLLeaderboard(seasonId),
    getHighRollerLeaderboard(seasonId),
    getLowRollerLeaderboard(seasonId),
  ])

  return (
    <div className="min-h-screen bg-[#040408] text-white flex flex-col font-sans relative overflow-hidden">
      
      {/* GLOBAL AMBIENT LIGHTING & GRID */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 casino-grid opacity-40"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-600/20 rounded-full blur-[150px] animate-float mix-blend-screen"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[40vw] h-[40vw] bg-purple-600/20 rounded-full blur-[150px] animate-float-delayed mix-blend-screen"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 md:px-12 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mb-4 drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
              The <span className="text-gold-gradient drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">Vault</span>
            </h1>
            <p className="text-white/50 text-sm md:text-base max-w-2xl mx-auto font-medium">
              Official live standings for the {season?.name || '2026 Season'}.
            </p>
          </div>

          {/* Interactive Client List */}
          <LeaderboardClient npl={nplBoard} hr={hrBoard} lr={lrBoard} />
        </main>
        
        <Footer />
      </div>
    </div>
  )
}