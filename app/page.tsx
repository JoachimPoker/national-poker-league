import { supabase } from '@/lib/supabase'
import { getNPLLeaderboard, getHighRollerLeaderboard, getLowRollerLeaderboard } from '@/lib/calculations'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HomeLeaderboard from '@/components/HomeLeaderboard'
import Link from 'next/link'

export const revalidate = 300

export default async function HomePage() {
  const { data: season } = await supabase
    .from('seasons')
    .select('*')
    .eq('is_active', true)
    .single()

  const seasonId = season?.id || 1

  const [nplBoard, hrBoard, lrBoard, eventsRes, newsRes, prizesRes] = await Promise.all([
    getNPLLeaderboard(seasonId),
    getHighRollerLeaderboard(seasonId),
    getLowRollerLeaderboard(seasonId),
    supabase
      .from('events')
      .select('*')
      .eq('season_id', seasonId)
      .order('start_date', { ascending: false })
      .limit(5),
    supabase
      .from('news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(3),
    supabase
      .from('season_prizes')
      .select('*')
      .eq('season_id', seasonId)
      .eq('league', 'npl')
      .order('position_from'),
  ])

  const events = eventsRes.data || []
  const news = newsRes.data || []
  const prizes = prizesRes.data || []

  const { count: playerCount } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true })

  const { count: eventCount } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('season_id', seasonId)

  const { data: prizeRows } = await supabase
    .from('results')
    .select('prize_amount')
    .eq('season_id', seasonId)

  const totalPrizeMoney = prizeRows?.reduce((sum, r) => sum + (r.prize_amount || 0), 0) || 0

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#080818' }}>
      <Navbar />

      {/* HERO */}
      <section style={{
        position: 'relative',
        minHeight: '500px',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/hero.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 35%',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, rgba(8,8,24,0.96) 0%, rgba(8,8,24,0.88) 40%, rgba(8,8,24,0.55) 70%, rgba(8,8,24,0.2) 100%)',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '140px',
          background: 'linear-gradient(to bottom, transparent, #080818)',
        }} />

        <div style={{
          position: 'relative', width: '100%',
          maxWidth: '1400px', margin: '0 auto',
          padding: '72px 48px',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(67,121,255,0.12)',
            border: '1px solid rgba(67,121,255,0.3)',
            borderRadius: '4px', padding: '6px 14px', marginBottom: '24px',
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4379FF' }} />
            <span style={{ fontSize: '10px', color: '#4379FF', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700 }}>
              {season?.name || '2026 Season'} · Week 12 · Live
            </span>
          </div>

          <h1 style={{
            fontSize: '72px', fontWeight: 900, color: '#ffffff',
            lineHeight: 1, marginBottom: '16px', letterSpacing: '-2px',
            textTransform: 'uppercase',
          }}>
            Where{' '}
            <span style={{
              background: 'linear-gradient(90deg, #C5A052, #FBF091, #C5A052)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Champions
            </span>
            <br />Are Made
          </h1>

          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginBottom: '40px', maxWidth: '460px' }}>
            Top 20 results count · +2 pts per additional cash · 15 venues across the UK
          </p>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '56px' }}>
            <Link href="/leaderboard" style={{
              background: '#4379FF', color: '#ffffff', fontWeight: 700,
              fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
              padding: '13px 28px', borderRadius: '4px', textDecoration: 'none',
            }}>
              View Leaderboard
            </Link>
            <Link href="/events" style={{
              background: 'transparent', color: '#ffffff', fontWeight: 600,
              fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
              padding: '13px 28px', borderRadius: '4px', textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.25)',
            }}>
              View Events
            </Link>
          </div>

          <div style={{ display: 'flex' }}>
            {[
              { value: playerCount?.toLocaleString() || '0', label: 'Active Players' },
              { value: eventCount?.toString() || '0', label: 'Events Played' },
              { value: `£${(totalPrizeMoney / 1000000).toFixed(1)}M`, label: 'Prize Money' },
              { value: '3', label: 'Active Leagues' },
            ].map((stat, i) => (
              <div key={i} style={{
                paddingRight: '40px', marginRight: '40px',
                borderRight: i < 3 ? '1px solid rgba(255,255,255,0.1)' : 'none',
              }}>
                <div style={{
                  fontSize: '38px', fontWeight: 900, letterSpacing: '-1px',
                  background: 'linear-gradient(90deg, #C5A052, #FBF091, #C5A052)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '4px' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BODY */}
      <main style={{ flex: 1, maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '48px 48px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '48px' }}>

          {/* LEFT */}
          <div>

            {/* Leaderboard — interactive client component */}
            <div style={{ marginBottom: '48px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '3px', textTransform: 'uppercase' }}>
                  Season Standings
                </span>
                <Link href="/leaderboard" style={{ fontSize: '11px', color: '#4379FF', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Full leaderboard ›
                </Link>
              </div>
              <HomeLeaderboard
                npl={nplBoard.slice(0, 8)}
                hr={hrBoard.slice(0, 8)}
                lr={lrBoard.slice(0, 8)}
              />
            </div>

            {/* Recent events */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '3px', textTransform: 'uppercase' }}>
                  Recent Events
                </span>
                <Link href="/events" style={{ fontSize: '11px', color: '#4379FF', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
                  All events ›
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {events.map(event => (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <div style={{
                      background: '#0d0d2a', border: '1px solid rgba(67,121,255,0.12)',
                      borderRadius: '8px', padding: '14px 18px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <div style={{ flex: 1, paddingRight: '16px' }}>
                        <div style={{ fontSize: '13px', color: '#ffffff', fontWeight: 600, marginBottom: '5px', lineHeight: 1.4 }}>
                          {event.tournament_name}
                        </div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{event.casino}</span>
                          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                            {event.start_date ? new Date(event.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                        <EventBadge event={event} />
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                          £{Number(event.buy_in).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Prizes */}
            {prizes.length > 0 && (
              <div style={{ background: '#0d0d2a', border: '1px solid rgba(67,121,255,0.15)', borderRadius: '8px', padding: '22px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '18px' }}>
                  Season Prizes — NPL
                </div>
                {prizes.map((prize: any) => (
                  <div key={prize.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{
                      fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600,
                      color: prize.position_from === 1 ? '#FBF091' : 'rgba(255,255,255,0.4)',
                    }}>
                      {prize.position_from === prize.position_to
                        ? `${prize.position_from}${ordinal(prize.position_from)} Place`
                        : `${prize.position_from}${ordinal(prize.position_from)} – ${prize.position_to}${ordinal(prize.position_to)}`}
                    </span>
                    <span style={{
                      fontWeight: 700,
                      fontSize: prize.position_from === 1 ? '16px' : '14px',
                      color: prize.position_from === 1 ? '#FBF091' : '#ffffff',
                    }}>
                      {prize.prize_description}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Leagues */}
            <div style={{ background: '#0d0d2a', border: '1px solid rgba(67,121,255,0.15)', borderRadius: '8px', padding: '22px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '18px' }}>
                The Leagues
              </div>
              {[
                { name: 'National Poker League', rule: 'Top 20 results + 2pts per extra cash', color: '#4379FF', href: '/leaderboard' },
                { name: 'High Roller League', rule: 'All results count · No cap', color: '#e8c870', href: '/leaderboard' },
                { name: 'Low Roller League', rule: 'Buy-in ≤ £300 · All results count', color: '#60c890', href: '/leaderboard' },
              ].map(league => (
                <Link key={league.name} href={league.href} style={{ display: 'block', marginBottom: '8px' }}>
                  <div style={{
                    padding: '13px 15px', borderRadius: '6px',
                    background: '#080818',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderLeft: `3px solid ${league.color}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', marginBottom: '3px' }}>
                        {league.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                        {league.rule}
                      </div>
                    </div>
                    <span style={{ color: league.color, fontSize: '18px', fontWeight: 700, flexShrink: 0, marginLeft: '12px' }}>›</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* News */}
            <div style={{ background: '#0d0d2a', border: '1px solid rgba(67,121,255,0.15)', borderRadius: '8px', padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '3px', textTransform: 'uppercase' }}>
                  Latest News
                </div>
                <Link href="/news" style={{ fontSize: '11px', color: '#4379FF', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
                  All ›
                </Link>
              </div>
              {news.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>No news yet</p>
              ) : (
                news.map((item: any) => (
                  <div key={item.id} style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '10px', color: '#4379FF', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                      {new Date(item.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, fontWeight: 500 }}>
                      {item.title}
                    </div>
                    {item.social_link && <NewsLink href={item.social_link} />}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function NewsLink({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{
      fontSize: '11px', color: '#4379FF', marginTop: '6px',
      display: 'inline-block', fontWeight: 600,
    }}>
      View post ›
    </a>
  )
}

function EventBadge({ event }: { event: any }) {
  if (event.is_high_roller) return (
    <span style={{
      fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
      padding: '4px 10px', borderRadius: '4px',
      background: 'rgba(232,200,112,0.12)', color: '#e8c870',
      border: '1px solid rgba(232,200,112,0.3)',
    }}>High Roller</span>
  )
  if (event.is_low_roller) return (
    <span style={{
      fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
      padding: '4px 10px', borderRadius: '4px',
      background: 'rgba(96,200,144,0.12)', color: '#60c890',
      border: '1px solid rgba(96,200,144,0.3)',
    }}>Low Roller</span>
  )
  return (
    <span style={{
      fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
      padding: '4px 10px', borderRadius: '4px',
      background: 'rgba(67,121,255,0.12)', color: '#4379FF',
      border: '1px solid rgba(67,121,255,0.25)',
    }}>Main</span>
  )
}

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}