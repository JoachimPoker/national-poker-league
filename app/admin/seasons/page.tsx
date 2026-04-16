'use client'
import { useState, useEffect } from 'react'

const NPL_RULES = [
  { key: 'top20_plus2', label: 'Top 20 results + 2pts per extra cash (2026)' },
  { key: 'top20', label: 'Top 20 results only (2025)' },
  { key: 'all', label: 'All results count (2024)' },
]

export default function AdminSeasonsPage() {
  const [seasons, setSeasons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [form, setForm] = useState({ name: '', year: '', npl_rule: 'top20_plus2' })

  useEffect(() => { fetchSeasons() }, [])

  async function fetchSeasons() {
    const res = await fetch('/api/admin/seasons')
    const data = await res.json()
    setSeasons(data.seasons || [])
    setLoading(false)
  }

  async function handleSave() {
    if (!form.name || !form.year) return
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/seasons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          year: parseInt(form.year),
          npl_rule: form.npl_rule,
          is_active: false,
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setForm({ name: '', year: '', npl_rule: 'top20_plus2' })
      setMessage({ type: 'success', text: 'Season created!' })
      fetchSeasons()
    } catch {
      setMessage({ type: 'error', text: 'Failed to create season' })
    } finally {
      setSaving(false)
    }
  }

  async function setActive(id: number) {
    await fetch('/api/admin/seasons', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchSeasons()
  }

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 500, color: 'var(--cream)', marginBottom: '8px' }}>
        Seasons
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '40px' }}>
        Manage seasons and upload previous season data
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        {/* Add season */}
        <div>
          <h2 style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-dimmest)', marginBottom: '20px' }}>
            Add Season
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { key: 'name', label: 'Season Name *', placeholder: 'e.g. 2025 Season', type: 'text' },
              { key: 'year', label: 'Year *', placeholder: 'e.g. 2025', type: 'number' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ display: 'block', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-dimmer)', marginBottom: '6px' }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  value={form[field.key as keyof typeof form]}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  style={{
                    width: '100%', background: '#0a0814',
                    border: '1px solid rgba(122,33,100,0.4)',
                    color: 'var(--cream)', padding: '10px 14px',
                    borderRadius: '4px', fontSize: '13px',
                  }}
                />
              </div>
            ))}

            <div>
              <label style={{ display: 'block', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-dimmer)', marginBottom: '6px' }}>
                NPL Points Rule *
              </label>
              <select
                value={form.npl_rule}
                onChange={e => setForm({ ...form, npl_rule: e.target.value })}
                style={{
                  width: '100%', background: '#0a0814',
                  border: '1px solid rgba(122,33,100,0.4)',
                  color: 'var(--cream)', padding: '10px 14px',
                  borderRadius: '4px', fontSize: '13px',
                }}
              >
                {NPL_RULES.map(r => (
                  <option key={r.key} value={r.key}>{r.label}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !form.name || !form.year}
              style={{
                background: form.name && form.year && !saving ? 'var(--plum)' : 'rgba(122,33,100,0.2)',
                border: 'none', color: 'var(--cream)',
                padding: '12px 24px', borderRadius: '4px',
                fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
                cursor: form.name && form.year && !saving ? 'pointer' : 'not-allowed',
                fontWeight: 500,
              }}
            >
              {saving ? 'Creating...' : 'Create Season'}
            </button>

            {message && (
              <div style={{
                padding: '12px 16px', borderRadius: '4px',
                background: message.type === 'success' ? 'rgba(0,100,0,0.1)' : 'rgba(100,0,0,0.1)',
                border: `1px solid ${message.type === 'success' ? 'rgba(0,200,0,0.2)' : 'rgba(200,0,0,0.2)'}`,
                fontSize: '13px',
                color: message.type === 'success' ? '#4ade80' : '#f87171',
              }}>
                {message.text}
              </div>
            )}
          </div>
        </div>

        {/* Seasons list */}
        <div>
          <h2 style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-dimmest)', marginBottom: '20px' }}>
            All Seasons
          </h2>
          {loading ? (
            <div style={{ fontSize: '13px', color: 'var(--text-dimmest)' }}>Loading...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {seasons.map(season => (
                <div key={season.id} style={{
                  background: '#0a0814',
                  border: `1px solid ${season.is_active ? 'rgba(213,149,22,0.4)' : 'rgba(122,33,100,0.25)'}`,
                  borderRadius: '4px', padding: '14px 16px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: season.is_active ? 'var(--gold)' : 'var(--cream)', marginBottom: '3px' }}>
                      {season.name}
                      {season.is_active && (
                        <span style={{
                          marginLeft: '8px', fontSize: '9px',
                          background: 'var(--gold)', color: '#0a0814',
                          padding: '2px 6px', borderRadius: '2px', fontWeight: 500,
                        }}>
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dimmest)' }}>
                      {NPL_RULES.find(r => r.key === season.npl_rule)?.label || season.npl_rule}
                    </div>
                  </div>
                  {!season.is_active && (
                    <button
                      onClick={() => setActive(season.id)}
                      style={{
                        background: 'rgba(213,149,22,0.1)', border: '1px solid rgba(213,149,22,0.3)',
                        color: 'var(--gold)', padding: '6px 12px', borderRadius: '4px',
                        fontSize: '11px', cursor: 'pointer',
                      }}
                    >
                      Set Active
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}