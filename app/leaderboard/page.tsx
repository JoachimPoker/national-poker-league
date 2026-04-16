import { supabase } from '@/lib/supabase'
import { getNPLLeaderboard, getHighRollerLeaderboard, getLowRollerLeaderboard } from '@/lib/calculations'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import LeaderboardClient from './LeaderboardClient'

export const revalidate = 300

export default async function LeaderboardPage() {
  const { data: season } = await supabase
    .from('seasons')
    .select('*')
    .eq('is_active', true)
    .single()

  const seasonId = season?.id || 1

  const [npl, hr, lr, prizes] = await Promise.all([
    getNPLLeaderboard(seasonId),
    getHighRollerLeaderboard(seasonId),
    getLowRollerLeaderboard(seasonId),
    supabase
      .from('season_prizes')
      .select('*')
      .eq('season_id', seasonId)
      .order('league')
      .order('position_from'),
  ])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#080818' }}>
      <Navbar />

      {/* Header */}
      <section style={{
        background: '#0a0820',
        padding: '48px 48px 40px',
        borderBottom: '1px solid rgba(67,121,255,0.15)',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{
            fontSize: '10px', color: '#4379FF', letterSpacing: '4px',
            textTransform: 'uppercase', fontWeight: 700, marginBottom: '12px',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <span style={{ width: '28px', height: '1px', background: '#4379FF', display: 'inline-block' }} />
            {season?.name || '2026 Season'}
          </div>
          <h1 style={{
            fontSize: '40px', fontWeight: 900, color: '#ffffff',
            letterSpacing: '-1px', marginBottom: '8px',
          }}>
            Season Leaderboards
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
            Live standings across all three leagues — updated every time a new file is uploaded
          </p>
        </div>
      </section>

      <main style={{ flex: 1, maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '40px 48px 64px' }}>
        <LeaderboardClient
          npl={npl}
          hr={hr}
          lr={lr}
          prizes={prizes.data || []}
        />
      </main>

      <Footer />
    </div>
  )
}