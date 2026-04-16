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

  const badgeColor = event.is_high_roller ? '#e8c870' : event.is_low_roller ? '#60c890' : '#4379FF'
  const badgeBg = event.is_high_roller ? 'rgba(232,200,112,0.12)' : event.is_low_roller ? 'rgba(96,200,144,0.12)' : 'rgba(67,121,255,0.12)'
  const badgeBorder = event.is_high_roller ? 'rgba(232,200,112,0.3)' : event.is_low_roller ? 'rgba(96,200,144,0.3)' : 'rgba(67,121,255,0.25)'
  const badgeLabel = event.is_high_roller ? 'High Roller' : event.is_low_roller ? 'Low Roller' : 'Main Event'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#080818' }}>
      <Navbar />

      {/* Header */}
      <section style={{
        background: '#0a0820',
        padding: '40px 48px',
        borderBottom: '1px solid rgba(67,121,255,0.15)',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Link href="/events" style={{
            fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px',
            textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center',
            gap: '6px', marginBottom: '24px', fontWeight: 600,
          }}>
            ← Back to events
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <span style={{
              fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
              padding: '4px 10px', borderRadius: '4px',
              background: badgeBg, color: badgeColor, border: `1px solid ${badgeBorder}`,
            }}>
              {badgeLabel}
            </span>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{event.casino}</span>
          </div>

          <h1 style={{
            fontSize: '30px', fontWeight: 900, color: '#ffffff',
            letterSpacing: '-0.5px', marginBottom: '8px', lineHeight: 1.2, maxWidth: '800px',
          }}>
            {event.tournament_name}
          </h1>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '32px' }}>
            {event.start_date
              ? new Date(event.start_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
              : '—'}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '0' }}>
            {[
              { label: 'Buy-in', value: `£${Number(event.buy_in).toLocaleString()}` },
              { label: 'Total Entries', value: allResults.length },
              { label: 'Prize Pool', value: `£${totalPrizeMoney.toLocaleString()}` },
              { label: 'Winner', value: winner?.players?.gdpr ? (winner.players as any).full_name : 'Anonymous' },
            ].map((stat, i) => (
              <div key={stat.label} style={{
                paddingRight: '36px', marginRight: '36px',
                borderRight: i < 3 ? '1px solid rgba(67,121,255,0.15)' : 'none',
              }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main style={{ flex: 1, maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '40px 48px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '40px' }}>

          {/* Results table */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '3px', textTransform: 'uppercase' }}>
                Full Results
              </span>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                {allResults.length} players cashed
              </span>
            </div>

            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(67,121,255,0.15)' }}>
              {/* Header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '70px 1fr 90px 100px',
                padding: '11px 20px', background: '#0d0d2a',
                borderBottom: '1px solid rgba(67,121,255,0.15)',
              }}>
                {['Finish', 'Player', 'Points', 'Prize'].map((col, i) => (
                  <div key={col} style={{
                    fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.25)', textAlign: i >= 2 ? 'right' : 'left',
                  }}>
                    {col}
                  </div>
                ))}
              </div>

              {allResults.map((result, index) => {
                const player = result.players as any
                const isWinner = result.finish_position === 1
                return (
                  <div key={result.id} style={{
                    display: 'grid', gridTemplateColumns: '70px 1fr 90px 100px',
                    padding: '12px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    alignItems: 'center',
                    background: isWinner ? 'rgba(197,160,82,0.06)' : index % 2 === 0 ? '#080818' : '#0a0a20',
                    position: 'relative',
                  }}>
                    {isWinner && (
                      <div style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
                        background: 'linear-gradient(180deg, #FBF091, #C5A052)',
                      }} />
                    )}

                    <div style={{
                      fontSize: isWinner ? '14px' : '13px', fontWeight: 800,
                      color: isWinner ? '#FBF091' : 'rgba(255,255,255,0.4)',
                    }}>
                      {result.finish_position}{ordinal(result.finish_position)}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '10px', fontWeight: 700,
                        background: isWinner ? 'rgba(197,160,82,0.15)' : 'rgba(67,121,255,0.12)',
                        color: isWinner ? '#FBF091' : '#4379FF',
                        border: `1px solid ${isWinner ? 'rgba(197,160,82,0.35)' : 'rgba(67,121,255,0.3)'}`,
                      }}>
                        {player?.gdpr ? player.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : '—'}
                      </div>
                      <div>
                        {player?.gdpr ? (
                          <Link href={`/players/${result.player_id}`} style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                            {player.full_name}
                          </Link>
                        ) : (
                          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>Anonymous Player</span>
                        )}
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '1px' }}>
                          {player?.gdpr ? player.home_casino : '—'}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '13px', fontWeight: 700, textAlign: 'right', color: '#ffffff' }}>
                      {result.points.toFixed(2)}
                    </div>

                    <div style={{
                      fontSize: '13px', textAlign: 'right', fontWeight: 700,
                      color: result.prize_amount > 0 ? '#ffffff' : 'rgba(255,255,255,0.2)',
                    }}>
                      {result.prize_amount > 0 ? `£${result.prize_amount.toLocaleString()}` : '—'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Event info */}
            <div style={{ background: '#0d0d2a', border: '1px solid rgba(67,121,255,0.15)', borderRadius: '8px', padding: '20px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' }}>
                Event Info
              </div>
              {[
                { label: 'Venue', value: event.casino },
                { label: 'Date', value: event.start_date ? new Date(event.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
                { label: 'Buy-in', value: `£${Number(event.buy_in).toLocaleString()}` },
                { label: 'Entries', value: allResults.length },
                { label: 'Prize Pool', value: `£${totalPrizeMoney.toLocaleString()}` },
                { label: 'Type', value: badgeLabel },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{item.label}</span>
                  <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: 700 }}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Prize breakdown */}
            {totalPrizeMoney > 0 && (
              <div style={{ background: '#0d0d2a', border: '1px solid rgba(67,121,255,0.15)', borderRadius: '8px', padding: '20px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' }}>
                  Prize Breakdown
                </div>
                {allResults.filter(r => r.prize_amount > 0).map(result => {
                  const player = result.players as any
                  return (
                    <div key={result.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                        {result.finish_position}{ordinal(result.finish_position)} — {player?.gdpr ? player.full_name : 'Anonymous'}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                        £{result.prize_amount.toLocaleString()}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}