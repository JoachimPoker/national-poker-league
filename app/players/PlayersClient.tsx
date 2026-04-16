'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'

const PAGE_SIZE = 50

export default function PlayersClient({ players, venues }: {
  players: any[]
  venues: string[]
}) {
  const [search, setSearch] = useState('')
  const [venue, setVenue] = useState('')
  const [sortBy, setSortBy] = useState('points')
  const [page, setPage] = useState(1)
  const [view, setView] = useState<'grid' | 'list'>('list')

  const filtered = useMemo(() => {
    let result = [...players]

    if (search.trim()) {
      const q = search.toLowerCase().trim()
      result = result.filter(p => p.full_name.toLowerCase().includes(q))
    }

    if (venue) {
      result = result.filter(p => p.home_casino === venue)
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'points') return b.total_points - a.total_points
      if (sortBy === 'results') return b.result_count - a.result_count
      if (sortBy === 'prize') return b.total_prize_money - a.total_prize_money
      if (sortBy === 'name') return a.full_name.localeCompare(b.full_name)
      return 0
    })

    return result
  }, [players, search, venue, sortBy])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleFilterChange(setter: (v: any) => void, value: any) {
    setter(value)
    setPage(1)
  }

  const nplRankMap = useMemo(() => {
    const map = new Map<number, number>()
    players.forEach((p, i) => map.set(p.player_id, i + 1))
    return map
  }, [players])

  return (
    <div>
      {/* Controls */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 200px 200px auto',
        gap: '12px', marginBottom: '24px', alignItems: 'end',
      }}>
        {/* Search */}
        <div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
            Search player
          </div>
          <input
            type="text"
            value={search}
            onChange={e => handleFilterChange(setSearch, e.target.value)}
            placeholder="Type a player name..."
            style={{
              width: '100%', background: '#0d0d2a',
              border: '1px solid rgba(67,121,255,0.25)',
              color: '#ffffff', padding: '10px 14px',
              borderRadius: '6px', fontSize: '14px',
            }}
          />
        </div>

        {/* Venue filter */}
        <div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
            Home venue
          </div>
          <select
            value={venue}
            onChange={e => handleFilterChange(setVenue, e.target.value)}
            style={{
              width: '100%', background: '#0d0d2a',
              border: '1px solid rgba(67,121,255,0.25)',
              color: venue ? '#ffffff' : 'rgba(255,255,255,0.35)',
              padding: '10px 14px', borderRadius: '6px', fontSize: '13px',
            }}
          >
            <option value="">All venues</option>
            {venues.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        {/* Sort */}
        <div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
            Sort by
          </div>
          <select
            value={sortBy}
            onChange={e => handleFilterChange(setSortBy, e.target.value)}
            style={{
              width: '100%', background: '#0d0d2a',
              border: '1px solid rgba(67,121,255,0.25)',
              color: '#ffffff', padding: '10px 14px',
              borderRadius: '6px', fontSize: '13px',
            }}
          >
            <option value="points">NPL Points</option>
            <option value="results">Most Results</option>
            <option value="prize">Prize Money</option>
            <option value="name">Name (A–Z)</option>
          </select>
        </div>

        {/* View toggle */}
        <div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
            View
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['list', 'grid'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: '10px 14px', borderRadius: '6px', cursor: 'pointer',
                  background: view === v ? '#1F1A5A' : 'transparent',
                  border: view === v ? '1px solid rgba(67,121,255,0.4)' : '1px solid rgba(67,121,255,0.2)',
                  color: view === v ? '#ffffff' : 'rgba(255,255,255,0.35)',
                  fontSize: '16px', fontWeight: 700,
                }}
              >
                {v === 'list' ? '☰' : '⊞'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count + clear */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
          {filtered.length === players.length
            ? `${players.length} players`
            : `${filtered.length} of ${players.length} players`}
        </div>
        {(search || venue) && (
          <button
            onClick={() => { setSearch(''); setVenue(''); setPage(1) }}
            style={{
              background: 'transparent', border: '1px solid rgba(67,121,255,0.25)',
              color: 'rgba(255,255,255,0.5)', padding: '6px 14px', borderRadius: '4px',
              fontSize: '11px', cursor: 'pointer',
            }}
          >
            Clear filters ×
          </button>
        )}
      </div>

      {/* Player list view */}
      {view === 'list' && (
        <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(67,121,255,0.15)' }}>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '56px 1fr 100px 110px 120px',
            padding: '11px 20px', background: '#0d0d2a',
            borderBottom: '1px solid rgba(67,121,255,0.15)',
          }}>
            {['Rank', 'Player', 'Results', 'Points', 'Prize Money'].map((col, i) => (
              <div key={col} style={{
                fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.25)', textAlign: i >= 3 ? 'right' : 'left',
              }}>
                {col}
              </div>
            ))}
          </div>

          {paginated.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', fontSize: '14px', color: 'rgba(255,255,255,0.25)', fontStyle: 'italic', background: '#080818' }}>
              No players found
            </div>
          ) : (
            paginated.map((player, index) => {
              const rank = nplRankMap.get(player.player_id) || 0
              const isFirst = rank === 1
              return (
                <Link key={player.player_id} href={`/players/${player.player_id}`}>
                  <div style={{
                    display: 'grid', gridTemplateColumns: '56px 1fr 160px 100px 110px 120px',
                    padding: '13px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    alignItems: 'center',
                    background: isFirst ? 'rgba(197,160,82,0.06)' : index % 2 === 0 ? '#080818' : '#0a0a20',
                    position: 'relative',
                    cursor: 'pointer',
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
                        width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: 700,
                        background: isFirst ? 'rgba(197,160,82,0.15)' : 'rgba(67,121,255,0.12)',
                        color: isFirst ? '#FBF091' : '#4379FF',
                        border: `1px solid ${isFirst ? 'rgba(197,160,82,0.35)' : 'rgba(67,121,255,0.3)'}`,
                      }}>
                        {player.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
                        {player.full_name}
                      </div>
                    </div>

                    {/* Results */}
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', textAlign: 'right', fontWeight: 600 }}>
                      {player.result_count}
                    </div>

                    {/* Points */}
                    <div style={{ fontSize: '15px', fontWeight: 800, textAlign: 'right', color: isFirst ? '#FBF091' : '#ffffff' }}>
                      {player.total_points.toFixed(2)}
                    </div>

                    {/* Prize money */}
                    <div style={{ fontSize: '13px', fontWeight: 600, textAlign: 'right', color: 'rgba(255,255,255,0.55)' }}>
                      {player.total_prize_money > 0 ? `£${player.total_prize_money.toLocaleString()}` : '—'}
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      )}

      {/* Player grid view */}
      {view === 'grid' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '12px',
        }}>
          {paginated.length === 0 ? (
            <div style={{ gridColumn: '1/-1', padding: '60px 20px', textAlign: 'center', fontSize: '14px', color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>
              No players found
            </div>
          ) : (
            paginated.map(player => {
              const rank = nplRankMap.get(player.player_id) || 0
              const isFirst = rank === 1
              return (
                <Link key={player.player_id} href={`/players/${player.player_id}`}>
                  <div style={{
                    background: '#0d0d2a',
                    border: `1px solid ${isFirst ? 'rgba(197,160,82,0.3)' : 'rgba(67,121,255,0.15)'}`,
                    borderRadius: '8px', padding: '20px',
                    cursor: 'pointer', position: 'relative', overflow: 'hidden',
                  }}>
                    {isFirst && (
                      <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                        background: 'linear-gradient(90deg, #C5A052, #FBF091, #C5A052)',
                      }} />
                    )}

                    {/* Avatar + rank */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '16px', fontWeight: 800,
                        background: isFirst ? 'rgba(197,160,82,0.15)' : 'rgba(67,121,255,0.12)',
                        color: isFirst ? '#FBF091' : '#4379FF',
                        border: `2px solid ${isFirst ? 'rgba(197,160,82,0.35)' : 'rgba(67,121,255,0.3)'}`,
                      }}>
                        {player.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div style={{
                        fontSize: '13px', fontWeight: 800,
                        color: isFirst ? '#FBF091' : 'rgba(255,255,255,0.25)',
                      }}>
                        #{rank}
                      </div>
                    </div>

                    {/* Name */}
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff', marginBottom: '4px', lineHeight: 1.3 }}>
                      {player.full_name}
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px' }}>
                      <div>
                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>Points</div>
                        <div style={{ fontSize: '16px', fontWeight: 900, color: isFirst ? '#FBF091' : '#ffffff' }}>
                          {player.total_points.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>Results</div>
                        <div style={{ fontSize: '16px', fontWeight: 900, color: '#ffffff' }}>
                          {player.result_count}
                        </div>
                      </div>
                    </div>
                    {player.total_prize_money > 0 && (
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>Prize Money</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
                          £{player.total_prize_money.toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              )
            })
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '24px 0', marginTop: '8px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} players
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <PageBtn onClick={() => setPage(1)} disabled={page === 1} label="«" />
            <PageBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} label="‹" />
            {getPageNumbers(page, totalPages).map((p, i) =>
              p === '...' ? (
                <span key={`e${i}`} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', padding: '0 6px', lineHeight: '32px' }}>...</span>
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
            <PageBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} label="›" />
            <PageBtn onClick={() => setPage(totalPages)} disabled={page === totalPages} label="»" />
          </div>
        </div>
      )}
    </div>
  )
}

function PageBtn({ onClick, disabled, label }: { onClick: () => void, disabled: boolean, label: string }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '32px', height: '32px', borderRadius: '4px',
      border: '1px solid rgba(67,121,255,0.2)', background: 'transparent',
      color: disabled ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)',
      fontSize: '14px', cursor: disabled ? 'not-allowed' : 'pointer',
    }}>{label}</button>
  )
}

function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total]
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
}