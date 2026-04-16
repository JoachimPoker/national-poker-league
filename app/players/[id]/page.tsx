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
  const wins = seasonResults.filter(r => r.finish_position === 1).length

  // NPL rank
  const nplLeaderboard = await getNPLLeaderboard(seasonId)
  const nplRank = nplLeaderboard.findIndex(e => e.player_id === playerId) + 1

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#080818' }}>
      <Navbar />

      {/* Header */}
      <section style={{
        background: '#0a0820',
        padding: '40px 48px',
        borderBottom: '1px solid rgba(67,121,255,0.15)',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Link href="/leaderboard" style={{
            fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px',
            textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center',
            gap: '6px', marginBottom: '24px', fontWeight: 600,
          }}>
            ← Back to leaderboard
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Avatar */}
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%', flexShrink: 0,
              background: 'rgba(67,121,255,0.12)',
              border: '2px solid rgba(67,121,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', fontWeight: 800, color: '#4379FF',
            }}>
              {player.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '10px', color: '#4379FF', letterSpacing: '3px',
                textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px',
              }}>
                Player Profile · {season?.name}
              </div>
              <h1 style={{
                fontSize: '36px', fontWeight: 900, color: '#ffffff',
                letterSpacing: '-0.5px', marginBottom: '4px',
              }}>
                {player.full_name}
              </h1>
            </div>

            {/* NPL rank badge */}
            {nplRank > 0 && (
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{
                  fontSize: '10px', color: 'rgba(255,255,255,0.35)',
                  textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '6px',
                }}>
                  NPL Rank
                </div>
                <div style={{
                  fontSize: '48px', fontWeight: 900, letterSpacing: '-2px',
                  color: nplRank === 1 ? '#FBF091' : '#ffffff',
                }}>
                  #{nplRank}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <main style={{ flex: 1, maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '40px 48px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '40px' }}>

          {/* LEFT */}
          <div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '40px' }}>
              {[
                { label: 'Total Cashes', value: seasonResults.length },
                { label: 'NPL Points', value: (Math.round(nplPoints * 100) / 100).toFixed(2) },
                { label: 'Prize Money', value: `£${totalPrizeMoney.toLocaleString()}` },
                { label: 'Best Finish', value: bestFinish > 0 ? `${bestFinish}${ordinal(bestFinish)}` : '—' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: '#0d0d2a',
                  border: '1px solid rgba(67,121,255,0.15)',
                  borderRadius: '8px', padding: '16px 18px',
                }}>
                  <div style={{
                    fontSize: '10px', color: 'rgba(255,255,255,0.35)',
                    textTransform: 'uppercase', letterSpacing: '1.5px',
                    marginBottom: '8px', fontWeight: 700,
                  }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#ffffff' }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* League breakdown */}
            <div style={{ marginBottom: '40px' }}>
              <div style={{
                fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)',
                letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px',
              }}>
                League Standing
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  { label: 'National Poker League', points: Math.round(nplPoints * 100) / 100, results: seasonResults.length, rank: nplRank, color: '#4379FF' },
                  { label: 'High Roller League', points: Math.round(hrPoints * 100) / 100, results: hrResults.length, rank: 0, color: '#e8c870' },
                  { label: 'Low Roller League', points: Math.round(lrPoints * 100) / 100, results: lrResults.length, rank: 0, color: '#60c890' },
                ].map(league => (
                  <div key={league.label} style={{
                    background: '#0d0d2a',
                    border: '1px solid rgba(67,121,255,0.15)',
                    borderLeft: `3px solid ${league.color}`,
                    borderRadius: '8px', padding: '16px',
                  }}>
                    <div style={{
                      fontSize: '11px', fontWeight: 700, color: league.color,
                      marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}>
                      {league.label}
                    </div>
                    <div style={{ fontSize: '26px', fontWeight: 900, color: '#ffffff', marginBottom: '4px' }}>
                      {league.points.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                      {league.results} result{league.results !== 1 ? 's' : ''}
                      {league.rank > 0 && ` · Rank #${league.rank}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Results table */}
            <div>
              <div style={{
                fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)',
                letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px',
              }}>
                All Results — {season?.name}
              </div>
              <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(67,121,255,0.15)' }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 130px 80px 80px 100px',
                  padding: '11px 20px', background: '#0d0d2a',
                  borderBottom: '1px solid rgba(67,121,255,0.15)',
                }}>
                  {['Event', 'Date', 'Finish', 'Buy-in', 'Points'].map((col, i) => (
                    <div key={col} style={{
                      fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.25)', textAlign: i >= 2 ? 'right' : 'left',
                    }}>
                      {col}
                    </div>
                  ))}
                </div>

                {seasonResults.map((result, index) => (
                  <div key={result.id} style={{
                    display: 'grid', gridTemplateColumns: '1fr 130px 80px 80px 100px',
                    padding: '12px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    alignItems: 'center',
                    background: index % 2 === 0 ? '#080818' : '#0a0a20',
                  }}>
                    <div>
                      <Link href={`/events/${result.event_id}`} style={{
                        fontSize: '12px', color: '#ffffff', fontWeight: 600,
                        lineHeight: 1.4, display: 'block',
                      }}>
                        {result.events?.tournament_name}
                      </Link>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px', alignItems: 'center' }}>
                        {result.events?.is_high_roller && (
                          <span style={{
                            fontSize: '9px', color: '#e8c870',
                            background: 'rgba(232,200,112,0.1)',
                            border: '1px solid rgba(232,200,112,0.25)',
                            padding: '2px 6px', borderRadius: '3px', fontWeight: 700,
                          }}>HR</span>
                        )}
                        {result.events?.is_low_roller && (
                          <span style={{
                            fontSize: '9px', color: '#60c890',
                            background: 'rgba(96,200,144,0.1)',
                            border: '1px solid rgba(96,200,144,0.25)',
                            padding: '2px 6px', borderRadius: '3px', fontWeight: 700,
                          }}>LR</span>
                        )}
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
                          {result.events?.casino}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textAlign: 'right' }}>
                      {result.events?.start_date
                        ? new Date(result.events.start_date).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })
                        : '—'}
                    </div>
                    <div style={{
                      fontSize: '13px', textAlign: 'right', fontWeight: 800,
                      color: result.finish_position === 1 ? '#FBF091' : '#ffffff',
                    }}>
                      {result.finish_position}{ordinal(result.finish_position)}
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textAlign: 'right' }}>
                      £{Number(result.events?.buy_in || 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 800, textAlign: 'right', color: '#ffffff' }}>
                      {result.points.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Achievements */}
            <div style={{
              background: '#0d0d2a',
              border: '1px solid rgba(67,121,255,0.15)',
              borderRadius: '8px', padding: '22px',
            }}>
              <div style={{
                fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)',
                letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '20px',
              }}>
                Achievements
              </div>
              <BadgeGrid badges={badges} />
            </div>

            {/* Prize money breakdown */}
            {totalPrizeMoney > 0 && (
              <div style={{
                background: '#0d0d2a',
                border: '1px solid rgba(67,121,255,0.15)',
                borderRadius: '8px', padding: '22px',
              }}>
                <div style={{
                  fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)',
                  letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px',
                }}>
                  Prize Money
                </div>
                {seasonResults
                  .filter(r => r.prize_amount > 0)
                  .sort((a, b) => b.prize_amount - a.prize_amount)
                  .map(result => (
                    <div key={result.id} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
                    }}>
                      <div style={{
                        fontSize: '12px', color: 'rgba(255,255,255,0.5)',
                        flex: 1, paddingRight: '8px', lineHeight: 1.4,
                      }}>
                        {result.events?.tournament_name?.split(' - ')[0] || result.events?.tournament_name}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', flexShrink: 0 }}>
                        £{result.prize_amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  paddingTop: '12px', marginTop: '4px',
                }}>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
                    Total
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#ffffff' }}>
                    £{totalPrizeMoney.toLocaleString()}
                  </div>
                </div>
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