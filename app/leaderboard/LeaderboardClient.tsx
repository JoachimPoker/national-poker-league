'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'

const LEAGUES = [
  { key: 'npl', label: 'National Poker League', shortLabel: 'NPL', color: '#4379FF', rule: 'Top 20 results + 2pts per extra cash' },
  { key: 'hr', label: 'High Roller League', shortLabel: 'High Roller', color: '#e8c870', rule: 'All results count · No cap' },
  { key: 'lr', label: 'Low Roller League', shortLabel: 'Low Roller', color: '#60c890', rule: 'Buy-in ≤ £300 · All results count' },
]

const PAGE_SIZE = 25

export default function LeaderboardClient({ npl, hr, lr, prizes }: {
  npl: any[]
  hr: any[]
  lr: any[]
  prizes: any[]
}) {
  const [activeLeague, setActiveLeague] = useState('npl')
  const [search, setSearch] = useState('')
  const [venueFilter, setVenueFilter] = useState('')
  const [minResults, setMinResults] = useState('')
  const [page, setPage] = useState(1)

  const data = activeLeague === 'npl' ? npl : activeLeague === 'hr' ? hr : lr
  const league = LEAGUES.find(l => l.key === activeLeague)!
  const leaguePrizes = prizes.filter(p => p.league === activeLeague)

  const venues = useMemo(() => {
    const all = data.map((e: any) => e.home_casino).filter(Boolean)
    return [...new Set(all)].sort()
  }, [data])

  const filtered = useMemo(() => {
    let result = data
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      result = result.filter((e: any) => e.gdpr && e.full_name.toLowerCase().includes(q))
    }
    if (venueFilter) result = result.filter((e: any) => e.home_casino === venueFilter)
    if (minResults) result = result.filter((e: any) => e.result_count >= parseInt(minResults))
    return result
  }, [data, search, venueFilter, minResults])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleLeagueChange(key: string) {
    setActiveLeague(key)
    setPage(1)
    setSearch('')
    setVenueFilter('')
    setMinResults('')
  }

  function handleFilterChange(setter: (v: string) => void, value: string) {
    setter(value)
    setPage(1)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '40px' }}>

      {/* Left */}
      <div>
        {/* League tabs */}
        <div style={{
          display: 'flex', gap: '4px', marginBottom: '24px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(67,121,255,0.15)',
          borderRadius: '6px', padding: '4px',
        }}>
          {LEAGUES.map(l => (
            <button
              key={l.key}
              onClick={() => handleLeagueChange(l.key)}
              style={{
                flex: 1, padding: '10px 12px', fontSize: '11px',
                letterSpacing: '1px', textTransform: 'uppercase',
                borderRadius: '4px', cursor: 'pointer', border: 'none',
                background: activeLeague === l.key ? '#1F1A5A' : 'transparent',
                color: activeLeague === l.key ? '#ffffff' : 'rgba(255,255,255,0.3)',
                outline: activeLeague === l.key ? '1px solid rgba(67,121,255,0.4)' : 'none',
                fontWeight: activeLeague === l.key ? 700 : 500,
              }}
            >
              {l.shortLabel}
            </button>
          ))}
        </div>

        {/* League info bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          marginBottom: '20px', paddingBottom: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ width: '3px', height: '32px', background: league.color, borderRadius: '2px', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', marginBottom: '3px' }}>{league.label}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{league.rule}</div>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
            {filtered.length} player{filtered.length !== 1 ? 's' : ''}
            {filtered.length !== data.length && (
              <span style={{ color: '#4379FF', marginLeft: '6px' }}>
                (filtered from {data.length})
              </span>
            )}
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          {/* Search */}
          <div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 700 }}>
              Search player
            </div>
            <input
              type="text"
              value={search}
              onChange={e => handleFilterChange(setSearch, e.target.value)}
              placeholder="Player name..."
              style={{
                width: '100%', background: '#0a0820',
                border: '1px solid rgba(67,121,255,0.25)',
                color: '#ffffff', padding: '9px 12px',
                borderRadius: '4px', fontSize: '13px',
              }}
            />
          </div>

          {/* Venue */}
          <div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 700 }}>
              Venue
            </div>
            <select
              value={venueFilter}
              onChange={e => handleFilterChange(setVenueFilter, e.target.value)}
              style={{
                width: '100%', background: '#0a0820',
                border: '1px solid rgba(67,121,255,0.25)',
                color: venueFilter ? '#ffffff' : 'rgba(255,255,255,0.35)',
                padding: '9px 12px', borderRadius: '4px', fontSize: '13px',
              }}
            >
              <option value="">All venues</option>
              {venues.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          {/* Min results */}
          <div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 700 }}>
              Min results
            </div>
            <select
              value={minResults}
              onChange={e => handleFilterChange(setMinResults, e.target.value)}
              style={{
                width: '100%', background: '#0a0820',
                border: '1px solid rgba(67,121,255,0.25)',
                color: minResults ? '#ffffff' : 'rgba(255,255,255,0.35)',
                padding: '9px 12px', borderRadius: '4px', fontSize: '13px',
              }}
            >
              <option value="">Any</option>
              {[1, 2, 3, 5, 10, 15, 20].map(n => (
                <option key={n} value={n}>{n}+ results</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear filters */}
        {(search || venueFilter || minResults) && (
          <button
            onClick={() => { setSearch(''); setVenueFilter(''); setMinResults(''); setPage(1) }}
            style={{
              background: 'transparent', border: '1px solid rgba(67,121,255,0.25)',
              color: 'rgba(255,255,255,0.5)', padding: '7px 16px', borderRadius: '4px',
              fontSize: '11px', cursor: 'pointer', marginBottom: '16px', letterSpacing: '0.5px',
            }}
          >
            Clear filters ×
          </button>
        )}

        {/* Table */}
        <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(67,121,255,0.15)' }}>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '56px 1fr 100px 100px 110px',
            padding: '11px 20px', background: '#0d0d2a',
            borderBottom: '1px solid rgba(67,121,255,0.15)',
          }}>
            {['Rank', 'Player', 'Results', 'Best Finish', 'Points'].map((col, i) => (
              <div key={col} style={{
                fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.25)', textAlign: i >= 2 ? 'right' : 'left',
              }}>
                {col}
              </div>
            ))}
          </div>

          {/* Rows */}
          {paginated.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.25)', fontStyle: 'italic', background: '#080818' }}>
              No players found matching your filters
            </div>
          ) : (
            paginated.map((entry, index) => {
              const rank = filtered.indexOf(entry) + 1
              const isFirst = rank === 1
              return (
                <div key={entry.player_id} style={{
                  display: 'grid', gridTemplateColumns: '56px 1fr 100px 100px 110px',
                  padding: '13px 20px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  alignItems: 'center',
                  background: isFirst ? 'rgba(197,160,82,0.06)' : index % 2 === 0 ? '#080818' : '#0a0a20',
                  position: 'relative',
                }}>
                  {isFirst && (
                    <div style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
                      background: 'linear-gradient(180deg, #FBF091, #C5A052)',
                    }} />
                  )}

                  {/* Rank */}
                  <div style={{
                    fontSize: rank <= 3 ? '14px' : '12px', fontWeight: 800,
                    color: isFirst ? '#FBF091' : rank === 2 ? 'rgba(255,255,255,0.6)' : rank === 3 ? '#9a8060' : 'rgba(255,255,255,0.25)',
                  }}>
                    {String(rank).padStart(2, '0')}
                  </div>

                  {/* Player */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 700,
                      background: isFirst ? 'rgba(197,160,82,0.15)' : 'rgba(67,121,255,0.12)',
                      color: isFirst ? '#FBF091' : '#4379FF',
                      border: `1px solid ${isFirst ? 'rgba(197,160,82,0.35)' : 'rgba(67,121,255,0.3)'}`,
                    }}>
                      {entry.gdpr ? entry.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : '—'}
                    </div>
                    <div>
                      {entry.gdpr ? (
                        <Link href={`/players/${entry.player_id}`} style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
                          {entry.full_name}
                        </Link>
                      ) : (
                        <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>Anonymous Player</span>
                      )}
                    </div>
                  </div>

                  {/* Results */}
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', textAlign: 'right', fontWeight: 600 }}>
                    {entry.result_count}
                    {entry.result_count > 20 && activeLeague === 'npl' && (
                      <span style={{ fontSize: '10px', color: '#4379FF', marginLeft: '4px' }}>
                        +{entry.result_count - 20}
                      </span>
                    )}
                  </div>

                  {/* Best finish */}
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', textAlign: 'right', fontWeight: 600 }}>
                    {entry.best_finish > 0 ? `${entry.best_finish}${ordinal(entry.best_finish)}` : '—'}
                  </div>

                  {/* Points */}
                  <div style={{ fontSize: '15px', fontWeight: 800, textAlign: 'right', color: isFirst ? '#FBF091' : '#ffffff' }}>
                    {entry.total_points.toFixed(2)}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 0', marginTop: '8px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} players
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {['«', '‹'].map((label, i) => (
                <button key={label} onClick={() => setPage(i === 0 ? 1 : p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    width: '32px', height: '32px', borderRadius: '4px', border: '1px solid rgba(67,121,255,0.2)',
                    background: 'transparent', color: page === 1 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)',
                    fontSize: '14px', cursor: page === 1 ? 'not-allowed' : 'pointer',
                  }}>{label}</button>
              ))}
              {getPageNumbers(page, totalPages).map((p, i) =>
                p === '...' ? (
                  <span key={`e${i}`} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', padding: '0 4px' }}>...</span>
                ) : (
                  <button key={p} onClick={() => setPage(p as number)} style={{
                    width: '32px', height: '32px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer',
                    border: page === p ? '1px solid #4379FF' : '1px solid rgba(67,121,255,0.2)',
                    background: page === p ? '#1F1A5A' : 'transparent',
                    color: page === p ? '#ffffff' : 'rgba(255,255,255,0.4)',
                    fontWeight: page === p ? 700 : 400,
                  }}>{p}</button>
                )
              )}
              {['›', '»'].map((label, i) => (
                <button key={label} onClick={() => setPage(i === 0 ? p => Math.min(totalPages, p + 1) : totalPages)}
                  disabled={page === totalPages}
                  style={{
                    width: '32px', height: '32px', borderRadius: '4px', border: '1px solid rgba(67,121,255,0.2)',
                    background: 'transparent', color: page === totalPages ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)',
                    fontSize: '14px', cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  }}>{label}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Prizes */}
        {leaguePrizes.length > 0 && (
          <div style={{ background: '#0d0d2a', border: '1px solid rgba(67,121,255,0.15)', borderRadius: '8px', padding: '20px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' }}>
              Season Prizes
            </div>
            {leaguePrizes.map((prize: any) => (
              <div key={prize.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{
                  fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600,
                  color: prize.position_from === 1 ? '#FBF091' : 'rgba(255,255,255,0.4)',
                }}>
                  {prize.position_from === prize.position_to
                    ? `${prize.position_from}${ordinal(prize.position_from)} Place`
                    : `${prize.position_from}${ordinal(prize.position_from)} – ${prize.position_to}${ordinal(prize.position_to)}`}
                </span>
                <span style={{
                  fontWeight: 700, fontSize: prize.position_from === 1 ? '16px' : '14px',
                  color: prize.position_from === 1 ? '#FBF091' : '#ffffff',
                }}>
                  {prize.prize_description}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div style={{ background: '#0d0d2a', border: '1px solid rgba(67,121,255,0.15)', borderRadius: '8px', padding: '20px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' }}>
            League Stats
          </div>
          {[
            { label: 'Players on board', value: data.length },
            { label: "Leader's points", value: data[0] ? data[0].total_points.toFixed(2) : '—' },
            { label: "Leader's results", value: data[0] ? data[0].result_count : '—' },
            { label: 'Average points', value: data.length > 0 ? (data.reduce((s: number, e: any) => s + e.total_points, 0) / data.length).toFixed(2) : '—' },
          ].map(stat => (
            <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{stat.label}</span>
              <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: 700 }}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Top 3 */}
        {data.length >= 3 && (
          <div style={{ background: '#0d0d2a', border: '1px solid rgba(67,121,255,0.15)', borderRadius: '8px', padding: '20px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' }}>
              Top 3
            </div>
            {data.slice(0, 3).map((entry: any, i: number) => {
              const colors = ['#FBF091', 'rgba(255,255,255,0.6)', '#9a8060']
              const labels = ['1st', '2nd', '3rd']
              return (
                <div key={entry.player_id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: colors[i], width: '28px', flexShrink: 0 }}>{labels[i]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {entry.gdpr ? (
                      <Link href={`/players/${entry.player_id}`} style={{
                        fontSize: '13px', color: '#ffffff', fontWeight: 700,
                        display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {entry.full_name}
                      </Link>
                    ) : (
                      <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>Anonymous</span>
                    )}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: colors[i], flexShrink: 0 }}>
                    {entry.total_points.toFixed(2)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total]
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
}

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}