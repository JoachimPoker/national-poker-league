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
            National Poker League
          </div>
          <h1 style={{ fontSize: '40px', fontWeight: 900, color: '#ffffff', letterSpacing: '-1px', marginBottom: '8px' }}>
            Season History
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
            Past seasons and their final leaderboards
          </p>
        </div>
      </section>

      <main style={{ flex: 1, maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '48px 48px 64px' }}>
        {allSeasons.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 40px',
            background: '#0d0d2a', border: '1px solid rgba(67,121,255,0.15)',
            borderRadius: '8px',
          }}>
            <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
              No historical seasons yet
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {allSeasons.map(season => (
              <SeasonCard key={season.id} season={season} />
            ))}
          </div>
        )}
      </main>

      <Footer />
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
    <div style={{
      background: '#0d0d2a',
      border: `1px solid ${season.is_active ? 'rgba(67,121,255,0.4)' : 'rgba(67,121,255,0.15)'}`,
      borderRadius: '8px', padding: '32px',
      position: 'relative',
    }}>
      {season.is_active && (
        <div style={{
          position: 'absolute', top: '20px', right: '20px',
          background: '#1F1A5A', color: '#4379FF',
          fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase',
          padding: '5px 12px', borderRadius: '4px', fontWeight: 700,
          border: '1px solid rgba(67,121,255,0.4)',
        }}>
          Current Season
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
        {/* Year */}
        <div style={{ flexShrink: 0 }}>
          <div style={{
            fontSize: '56px', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1,
            color: season.is_active ? '#ffffff' : 'rgba(255,255,255,0.35)',
          }}>
            {season.year}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '6px', fontWeight: 600 }}>
            {season.name}
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', background: 'rgba(67,121,255,0.15)', alignSelf: 'stretch' }} />

        {/* Stats and links */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '24px' }}>
            {[
              { label: 'Events', value: eventCount },
              { label: 'Players', value: uniquePlayers },
              { label: 'NPL Rule', value: ruleLabel },
            ].map(stat => (
              <div key={stat.label}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', fontWeight: 700 }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: '15px', color: '#ffffff', fontWeight: 700 }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href={`/leaderboard?season=${season.id}`} style={{
              fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
              color: '#ffffff', fontWeight: 700,
              background: '#4379FF',
              padding: '10px 20px', borderRadius: '4px',
            }}>
              View Leaderboard
            </Link>
            <Link href={`/events?season=${season.id}`} style={{
              fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.6)', fontWeight: 600,
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              padding: '10px 20px', borderRadius: '4px',
            }}>
              View Events
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}