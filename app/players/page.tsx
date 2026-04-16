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

  // Get full NPL leaderboard — contains all player data we need
  const nplBoard = await getNPLLeaderboard(seasonId)

  // Get unique venues for filter dropdown
  const venues = [...new Set(
    nplBoard
      .filter(e => e.gdpr && e.home_casino)
      .map(e => e.home_casino)
  )].sort()

  // Only show GDPR-consenting players
  const players = nplBoard.filter(e => e.gdpr)

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
            Player Directory
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
            {players.length} players active this season across {venues.length} venues
          </p>
        </div>
      </section>

      <main style={{ flex: 1, maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '40px 48px 64px' }}>
        <PlayersClient players={players} venues={venues} />
      </main>

      <Footer />
    </div>
  )
}