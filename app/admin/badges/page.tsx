'use client'
import { useState, useEffect } from 'react'

const SEASON_WINNER_BADGES = [
  { key: 'npl_winner', label: 'NPL Winner', color: '#FBF091' },
  { key: 'hr_winner',  label: 'High Roller Winner', color: '#e8c870' },
  { key: 'lr_winner',  label: 'Low Roller Winner', color: '#60c890' },
]

export default function AdminBadgesPage() {
  const [seasons, setSeasons] = useState<any[]>([])
  const [badges, setBadges] = useState<any[]>([])
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [form, setForm] = useState({
    player_id: '',
    badge_key: 'npl_winner',
    season_year: new Date().getFullYear().toString(),
    awarded_by: '',
  })
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([fetchSeasons(), fetchBadges(), fetchPlayers()])
      .finally(() => setLoading(false))
  }, [])

  async function fetchSeasons() {
    const res = await fetch('/api/admin/seasons')
    const data = await res.json()
    setSeasons(data.seasons || [])
  }

  async function fetchBadges() {
    const res = await fetch('/api/admin/badges')
    const data = await res.json()
    setBadges(data.badges || [])
  }

  async function fetchPlayers() {
    const res = await fetch('/api/admin/players-list')
    const data = await res.json()
    setPlayers(data.players || [])
  }

  async function handleAward() {
    if (!form.player_id || !form.badge_key) return
    setSaving(true)
    setMessage(null)
    try {
      const player = players.find(p => p.id === parseInt(form.player_id))
      const badgeDef = SEASON_WINNER_BADGES.find(b => b.key === form.badge_key)
      const badge_name = `${badgeDef?.label} ${form.season_year}`
      const badge_key = `${form.badge_key}_${form.season_year}`

      const res = await fetch('/api/admin/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: parseInt(form.player_id),
          badge_key,
          badge_name,
          season_year: parseInt(form.season_year),
          awarded_by: form.awarded_by || 'Admin',
        }),
      })
      if (!res.ok) throw new Error('Failed to award badge')
      setMessage({ type: 'success', text: `Badge awarded to ${player?.full_name}!` })
      fetchBadges()
    } catch {
      setMessage({ type: 'error', text: 'Failed to award badge' })
    } finally {
      setSaving(false)
    }
  }

  async function handleRevoke(id: number) {
    await fetch(`/api/admin/badges?id=${id}`, { method: 'DELETE' })
    fetchBadges()
  }

  async function handleAutoDetect() {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/badges/auto-detect', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMessage({ type: 'success', text: `Auto-detected ${data.awarded} season winner badge(s)` })
      fetchBadges()
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message })
    } finally {
      setSaving(false)
    }
  }

  const filteredPlayers = players.filter(p =>
    p.full_name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 20)

  if (loading) return <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Loading...</div>

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#ffffff', marginBottom: '8px' }}>
        Badge Management
      </h1>
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '32px' }}>
        Award past season winner badges and manage manual overrides
      </p>

      {/* Auto detect */}
      <div style={{ background: '#0d0d2a', border: '1px solid rgba(67,121,255,0.2)', borderRadius: '8px', padding: '20px', marginBottom: '32px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
          Auto-detect Season Winners
        </div>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '16px' }}>
          Automatically finds the #1 player on each league leaderboard for each uploaded season and awards them the correct winner badge.
        </p>
        <button
          onClick={handleAutoDetect}
          disabled={saving}
          style={{
            background: '#4379FF', border: 'none', color: '#ffffff',
            padding: '11px 24px', borderRadius: '4px', fontSize: '12px',
            letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Detecting...' : 'Auto-detect Winners'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>

        {/* Award form */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>
            Manually Award Badge
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Player search */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                Player *
              </label>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search player name..."
                style={{ width: '100%', background: '#080818', border: '1px solid rgba(67,121,255,0.25)', color: '#ffffff', padding: '10px 14px', borderRadius: '4px', fontSize: '13px', marginBottom: '6px' }}
              />
              {search && (
                <div style={{ background: '#080818', border: '1px solid rgba(67,121,255,0.2)', borderRadius: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                  {filteredPlayers.map(p => (
                    <div
                      key={p.id}
                      onClick={() => { setForm({ ...form, player_id: p.id.toString() }); setSearch(p.full_name) }}
                      style={{
                        padding: '10px 14px', fontSize: '13px', cursor: 'pointer',
                        color: form.player_id === p.id.toString() ? '#4379FF' : '#ffffff',
                        background: form.player_id === p.id.toString() ? 'rgba(67,121,255,0.08)' : 'transparent',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      {p.full_name}
                    </div>
                  ))}
                  {filteredPlayers.length === 0 && (
                    <div style={{ padding: '12px 14px', fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>No players found</div>
                  )}
                </div>
              )}
            </div>

            {/* Badge type */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                Badge Type *
              </label>
              <select
                value={form.badge_key}
                onChange={e => setForm({ ...form, badge_key: e.target.value })}
                style={{ width: '100%', background: '#080818', border: '1px solid rgba(67,121,255,0.25)', color: '#ffffff', padding: '10px 14px', borderRadius: '4px', fontSize: '13px' }}
              >
                {SEASON_WINNER_BADGES.map(b => (
                  <option key={b.key} value={b.key}>{b.label}</option>
                ))}
              </select>
            </div>

            {/* Season year */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                Season Year *
              </label>
              <select
                value={form.season_year}
                onChange={e => setForm({ ...form, season_year: e.target.value })}
                style={{ width: '100%', background: '#080818', border: '1px solid rgba(67,121,255,0.25)', color: '#ffffff', padding: '10px 14px', borderRadius: '4px', fontSize: '13px' }}
              >
                {[2026, 2025, 2024, 2023, 2022].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Awarded by */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                Awarded By
              </label>
              <input
                type="text"
                value={form.awarded_by}
                onChange={e => setForm({ ...form, awarded_by: e.target.value })}
                placeholder="Your name..."
                style={{ width: '100%', background: '#080818', border: '1px solid rgba(67,121,255,0.25)', color: '#ffffff', padding: '10px 14px', borderRadius: '4px', fontSize: '13px' }}
              />
            </div>

            <button
              onClick={handleAward}
              disabled={saving || !form.player_id}
              style={{
                background: form.player_id && !saving ? '#1F1A5A' : 'rgba(67,121,255,0.1)',
                border: '1px solid rgba(67,121,255,0.4)', color: '#ffffff',
                padding: '12px 24px', borderRadius: '4px', fontSize: '12px',
                letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700,
                cursor: form.player_id && !saving ? 'pointer' : 'not-allowed',
              }}
            >
              {saving ? 'Awarding...' : 'Award Badge'}
            </button>

            {message && (
              <div style={{
                padding: '12px 16px', borderRadius: '4px',
                background: message.type === 'success' ? 'rgba(0,180,80,0.1)' : 'rgba(200,50,50,0.1)',
                border: `1px solid ${message.type === 'success' ? 'rgba(0,180,80,0.25)' : 'rgba(200,50,50,0.25)'}`,
                fontSize: '13px',
                color: message.type === 'success' ? '#4ade80' : '#f87171',
              }}>
                {message.text}
              </div>
            )}
          </div>
        </div>

        {/* Awarded badges list */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>
            Awarded Badges ({badges.length})
          </div>
          {badges.length === 0 ? (
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>
              No badges awarded yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '500px', overflowY: 'auto' }}>
              {badges.map(badge => (
                <div key={badge.id} style={{
                  background: '#080818', border: '1px solid rgba(67,121,255,0.12)',
                  borderRadius: '6px', padding: '12px 16px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', marginBottom: '3px' }}>
                      {badge.badge_name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                      {badge.players?.full_name} · Awarded by {badge.awarded_by || 'Admin'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevoke(badge.id)}
                    style={{
                      background: 'rgba(200,50,50,0.1)', border: '1px solid rgba(200,50,50,0.25)',
                      color: '#f87171', padding: '5px 12px', borderRadius: '4px',
                      fontSize: '11px', cursor: 'pointer', flexShrink: 0,
                    }}
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}