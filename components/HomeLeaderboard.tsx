'use client'
import { useState } from 'react'
import Link from 'next/link'

const LEAGUES = [
  { key: 'npl', label: 'NPL Main', activeClass: 'lb-tab-active-npl' },
  { key: 'hr',  label: 'High Roller', activeClass: 'lb-tab-active-hr' },
  { key: 'lr',  label: 'Low Roller', activeClass: 'lb-tab-active-lr' },
]

function getBadgeChips(entry: any, league: string) {
  const chips: { label: string; cls: string }[] = []
  if (league === 'npl' && entry.rank === 1) chips.push({ label: 'NPL Champion', cls: 'badge-chip badge-chip-gold' })
  if (league === 'hr'  && entry.rank === 1) chips.push({ label: 'HR Champion',  cls: 'badge-chip badge-chip-gold' })
  if (league === 'lr'  && entry.rank === 1) chips.push({ label: 'LR Champion',  cls: 'badge-chip badge-chip-green' })
  if (league === 'npl' && entry.rank <= 3 && entry.rank > 1) chips.push({ label: 'Podium', cls: 'badge-chip badge-chip-blue' })
  if (league === 'npl' && entry.rank <= 10 && entry.rank > 3) chips.push({ label: 'Top 10', cls: 'badge-chip badge-chip-blue' })
  return chips
}

export default function HomeLeaderboard({ npl, hr, lr }: {
  npl: any[]
  hr: any[]
  lr: any[]
}) {
  const [active, setActive] = useState('npl')
  const [search, setSearch] = useState('')

  const rawData = active === 'npl' ? npl : active === 'hr' ? hr : lr

  const data = search.trim()
    ? rawData.filter(e =>
        e.gdpr && e.full_name?.toLowerCase().includes(search.toLowerCase())
      )
    : rawData

  const accentColor =
    active === 'hr' ? 'var(--hr-color)' :
    active === 'lr' ? 'var(--lr-color)' :
    'var(--blue)'

  return (
    <div>
      {/* Tab bar */}
      <div className="lb-tab-bar" style={{ marginBottom: '0' }}>
        {LEAGUES.map(tab => {
          const isActive = active === tab.key
          return (
            <button
              key={tab.key}
              className={`lb-tab${isActive ? ` ${tab.activeClass}` : ''}`}
              onClick={() => { setActive(tab.key); setSearch('') }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Search */}
      <input
        className="lb-search"
        placeholder="Search players…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* Table */}
      <div style={{
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid rgba(67,121,255,0.15)',
        marginTop: '10px',
      }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '52px 1fr auto 100px',
          padding: '11px 20px',
          background: '#0d0d2a',
          borderBottom: '1px solid rgba(67,121,255,0.15)',
        }}>
          {[
            { label: 'Rank', right: false },
            { label: 'Player', right: false },
            { label: '', right: false },
            { label: 'Points', right: true },
          ].map((col, i) => (
            <div key={i} style={{
              fontSize: '10px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.25)',
              textAlign: col.right ? 'right' : 'left',
            }}>
              {col.label}
            </div>
          ))}
        </div>

        {/* Rows */}
        {data.length === 0 ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.25)',
            fontStyle: 'italic',
            background: '#080818',
          }}>
            {search ? 'No players match your search' : 'No results for this league yet'}
          </div>
        ) : (
          data.map((entry, index) => {
            const rank = index + 1
            const isFirst = rank === 1
            const chips = getBadgeChips({ ...entry, rank }, active)

            return (
              <div
                key={entry.player_id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '52px 1fr auto 100px',
                  padding: '13px 20px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  alignItems: 'center',
                  gap: '8px',
                  background: isFirst
                    ? 'rgba(197,160,82,0.06)'
                    : index % 2 === 0 ? '#080818' : '#0a0a20',
                  position: 'relative',
                  transition: 'background 0.15s ease',
                }}
              >
                {/* Gold left border on #1 */}
                {isFirst && (
                  <div style={{
                    position: 'absolute',
                    left: 0, top: 0, bottom: 0,
                    width: '3px',
                    background: 'linear-gradient(180deg, #FBF091, #C5A052)',
                    borderRadius: '0 0 0 8px',
                  }} />
                )}

                {/* Rank */}
                <div style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: rank <= 3 ? '14px' : '12px',
                  fontWeight: 700,
                  color: isFirst
                    ? '#FBF091'
                    : rank === 2 ? 'rgba(255,255,255,0.55)'
                    : rank === 3 ? '#9a8060'
                    : 'rgba(255,255,255,0.22)',
                }}>
                  {String(rank).padStart(2, '0')}
                </div>

                {/* Player name + avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div style={{
                    width: '34px', height: '34px',
                    borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 700,
                    background: isFirst
                      ? 'rgba(197,160,82,0.15)'
                      : 'rgba(67,121,255,0.12)',
                    color: isFirst ? '#FBF091' : accentColor,
                    border: `1px solid ${isFirst ? 'rgba(197,160,82,0.35)' : 'rgba(67,121,255,0.3)'}`,
                  }}>
                    {entry.gdpr
                      ? entry.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
                      : '—'}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    {entry.gdpr ? (
                      <Link
                        href={`/players/${entry.player_id}`}
                        style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}
                      >
                        {entry.full_name}
                      </Link>
                    ) : (
                      <span style={{
                        fontSize: '14px',
                        color: 'rgba(255,255,255,0.22)',
                        fontStyle: 'italic',
                      }}>
                        Anonymous Player
                      </span>
                    )}
                    <div style={{
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.3)',
                      marginTop: '1px',
                      fontFamily: 'var(--font-mono, monospace)',
                    }}>
                      {entry.result_count} {entry.result_count === 1 ? 'result' : 'results'}
                    </div>
                  </div>
                </div>

                {/* Badge chips */}
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {chips.map(chip => (
                    <span key={chip.label} className={chip.cls}>{chip.label}</span>
                  ))}
                </div>

                {/* Points */}
                <div style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: isFirst ? '17px' : '15px',
                  fontWeight: 700,
                  textAlign: 'right',
                  color: isFirst ? '#FBF091' : '#ffffff',
                }}>
                  {entry.total_points.toFixed(2)}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}