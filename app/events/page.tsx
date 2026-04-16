import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const revalidate = 300

export default async function EventsPage() {
  const { data: season } = await supabase
    .from('seasons')
    .select('*')
    .eq('is_active', true)
    .single()

  const seasonId = season?.id || 1

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('season_id', seasonId)
    .order('start_date', { ascending: false })

  let allResultCounts: any[] = []
  let from = 0
  while (true) {
    const { data } = await supabase
      .from('results')
      .select('event_id')
      .eq('season_id', seasonId)
      .range(from, from + 999)
    if (!data || data.length === 0) break
    allResultCounts = allResultCounts.concat(data)
    if (data.length < 1000) break
    from += 1000
  }

  const countMap = new Map<number, number>()
  for (const r of allResultCounts) {
    countMap.set(r.event_id, (countMap.get(r.event_id) || 0) + 1)
  }

  const allEvents = events || []
  const highRollers = allEvents.filter(e => e.is_high_roller)
  const mainEvents = allEvents.filter(e => !e.is_high_roller && !e.is_low_roller)
  const lowRollers = allEvents.filter(e => e.is_low_roller)

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
          <h1 style={{ fontSize: '40px', fontWeight: 900, color: '#ffffff', letterSpacing: '-1px', marginBottom: '8px' }}>
            Events
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '32px' }}>
            All events across the season — click any event to see full results
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '0' }}>
            {[
              { value: allEvents.length, label: 'Total Events' },
              { value: mainEvents.length, label: 'Main Events' },
              { value: highRollers.length, label: 'High Roller Events' },
              { value: lowRollers.length, label: 'Low Roller Events' },
            ].map((stat, i) => (
              <div key={stat.label} style={{
                paddingRight: '36px', marginRight: '36px',
                borderRight: i < 3 ? '1px solid rgba(67,121,255,0.15)' : 'none',
              }}>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#ffffff' }}>{stat.value}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '4px' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main style={{ flex: 1, maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '40px 48px 64px' }}>
        {[
          { label: 'High Roller Events', events: highRollers, color: '#e8c870' },
          { label: 'Main Events', events: mainEvents, color: '#4379FF' },
          { label: 'Low Roller Events', events: lowRollers, color: '#60c890' },
        ].map(group => group.events.length > 0 && (
          <div key={group.label} style={{ marginBottom: '48px' }}>
            {/* Group label */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              marginBottom: '16px',
            }}>
              <div style={{ width: '3px', height: '16px', background: group.color, borderRadius: '2px', flexShrink: 0 }} />
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '3px', textTransform: 'uppercase' }}>
                {group.label}
              </span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>{group.events.length} events</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {group.events.map(event => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <div style={{
                    background: '#0d0d2a',
                    border: '1px solid rgba(67,121,255,0.12)',
                    borderRadius: '8px', padding: '14px 20px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 160px 80px 90px 110px',
                    alignItems: 'center', gap: '16px',
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#ffffff', fontWeight: 600, marginBottom: '4px', lineHeight: 1.4 }}>
                        {event.tournament_name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                        {event.casino}
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                      {event.start_date
                        ? new Date(event.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#ffffff', fontWeight: 600, textAlign: 'right' }}>
                      £{Number(event.buy_in).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textAlign: 'right' }}>
                      {countMap.get(event.id) || 0} entries
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
                        padding: '4px 10px', borderRadius: '4px',
                        background: event.is_high_roller ? 'rgba(232,200,112,0.12)' : event.is_low_roller ? 'rgba(96,200,144,0.12)' : 'rgba(67,121,255,0.12)',
                        color: event.is_high_roller ? '#e8c870' : event.is_low_roller ? '#60c890' : '#4379FF',
                        border: `1px solid ${event.is_high_roller ? 'rgba(232,200,112,0.3)' : event.is_low_roller ? 'rgba(96,200,144,0.3)' : 'rgba(67,121,255,0.25)'}`,
                      }}>
                        {event.is_high_roller ? 'High Roller' : event.is_low_roller ? 'Low Roller' : 'Main'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </main>

      <Footer />
    </div>
  )
}