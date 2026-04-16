'use client'
import { useState, useEffect } from 'react'

const LEAGUES = [
  { key: 'npl', label: 'National Poker League' },
  { key: 'hr', label: 'High Roller League' },
  { key: 'lr', label: 'Low Roller League' },
]

export default function AdminPrizesPage() {
  const [prizes, setPrizes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [activeLeague, setActiveLeague] = useState('npl')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [form, setForm] = useState({
    position_from: '',
    position_to: '',
    prize_description: '',
    prize_amount: '',
  })

  useEffect(() => { fetchPrizes() }, [])

  async function fetchPrizes() {
    const res = await fetch('/api/admin/prizes')
    const data = await res.json()
    setPrizes(data.prizes || [])
    setLoading(false)
  }

  async function handleSave() {
    if (!form.position_from || !form.prize_description) return
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/prizes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          league: activeLeague,
          season_id: 1,
          position_from: parseInt(form.position_from),
          position_to: parseInt(form.position_to || form.position_from),
          prize_description: form.prize_description,
          prize_amount: parseFloat(form.prize_amount || '0'),
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setForm({ position_from: '', position_to: '', prize_description: '', prize_amount: '' })
      setMessage({ type: 'success', text: 'Prize added!' })
      fetchPrizes()
    } catch {
      setMessage({ type: 'error', text: 'Failed to save prize' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    setDeleting(id)
    await fetch(`/api/admin/prizes?id=${id}`, { method: 'DELETE' })
    fetchPrizes()
    setDeleting(null)
  }

  const leaguePrizes = prizes.filter(p => p.league === activeLeague)

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 500, color: 'var(--cream)', marginBottom: '8px' }}>
        Season Prizes
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '32px' }}>
        Set the end-of-season prize structure for each league
      </p>

      {/* League tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
        {LEAGUES.map(l => (
          <button
            key={l.key}
            onClick={() => setActiveLeague(l.key)}
            style={{
              padding: '8px 20px', fontSize: '11px', letterSpacing: '1.5px',
              textTransform: 'uppercase', borderRadius: '2px', cursor: 'pointer',
              border: 'none',
              background: activeLeague === l.key ? 'var(--plum)' : 'rgba(122,33,100,0.15)',
              color: activeLeague === l.key ? 'var(--cream)' : 'var(--text-dimmer)',
            }}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>

        {/* Add prize form */}
        <div>
          <h2 style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-dimmest)', marginBottom: '20px' }}>
            Add Prize
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-dimmer)', marginBottom: '6px' }}>
                  Position From *
                </label>
                <input
                  type="number"
                  value={form.position_from}
                  onChange={e => setForm({ ...form, position_from: e.target.value })}
                  placeholder="e.g. 1"
                  style={{
                    width: '100%', background: '#0a0814',
                    border: '1px solid rgba(122,33,100,0.4)',
                    color: 'var(--cream)', padding: '10px 14px',
                    borderRadius: '4px', fontSize: '13px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-dimmer)', marginBottom: '6px' }}>
                  Position To
                </label>
                <input
                  type="number"
                  value={form.position_to}
                  onChange={e => setForm({ ...form, position_to: e.target.value })}
                  placeholder="Leave blank if single"
                  style={{
                    width: '100%', background: '#0a0814',
                    border: '1px solid rgba(122,33,100,0.4)',
                    color: 'var(--cream)', padding: '10px 14px',
                    borderRadius: '4px', fontSize: '13px',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-dimmer)', marginBottom: '6px' }}>
                Prize Description *
              </label>
              <input
                value={form.prize_description}
                onChange={e => setForm({ ...form, prize_description: e.target.value })}
                placeholder="e.g. £5,000 or GUKPT Main Event Seat"
                style={{
                  width: '100%', background: '#0a0814',
                  border: '1px solid rgba(122,33,100,0.4)',
                  color: 'var(--cream)', padding: '10px 14px',
                  borderRadius: '4px', fontSize: '13px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-dimmer)', marginBottom: '6px' }}>
                Prize Amount (£) — optional
              </label>
              <input
                type="number"
                value={form.prize_amount}
                onChange={e => setForm({ ...form, prize_amount: e.target.value })}
                placeholder="e.g. 5000"
                style={{
                  width: '100%', background: '#0a0814',
                  border: '1px solid rgba(122,33,100,0.4)',
                  color: 'var(--cream)', padding: '10px 14px',
                  borderRadius: '4px', fontSize: '13px',
                }}
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !form.position_from || !form.prize_description}
              style={{
                background: form.position_from && form.prize_description && !saving ? 'var(--plum)' : 'rgba(122,33,100,0.2)',
                border: 'none', color: 'var(--cream)',
                padding: '12px 24px', borderRadius: '4px',
                fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
                cursor: form.position_from && form.prize_description && !saving ? 'pointer' : 'not-allowed',
                fontWeight: 500,
              }}
            >
              {saving ? 'Saving...' : 'Add Prize'}
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

        {/* Current prizes */}
        <div>
          <h2 style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-dimmest)', marginBottom: '20px' }}>
            Current Prizes
          </h2>
          {loading ? (
            <div style={{ fontSize: '13px', color: 'var(--text-dimmest)' }}>Loading...</div>
          ) : leaguePrizes.length === 0 ? (
            <div style={{ fontSize: '13px', color: 'var(--text-dimmest)', fontStyle: 'italic' }}>
              No prizes set for this league yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {leaguePrizes
                .sort((a, b) => a.position_from - b.position_from)
                .map(prize => (
                  <div key={prize.id} style={{
                    background: '#0a0814',
                    border: '1px solid rgba(122,33,100,0.25)',
                    borderRadius: '4px', padding: '14px 16px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--text-dimmer)', marginBottom: '3px' }}>
                        {prize.position_from === prize.position_to
                          ? `Position ${prize.position_from}`
                          : `Positions ${prize.position_from} – ${prize.position_to}`}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--gold)' }}>
                        {prize.prize_description}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(prize.id)}
                      disabled={deleting === prize.id}
                      style={{
                        background: 'rgba(200,0,0,0.1)', border: '1px solid rgba(200,0,0,0.2)',
                        color: '#f87171', padding: '4px 10px', borderRadius: '4px',
                        fontSize: '11px', cursor: 'pointer',
                      }}
                    >
                      {deleting === prize.id ? '...' : 'Delete'}
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