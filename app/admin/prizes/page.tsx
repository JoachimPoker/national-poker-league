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
      <h1 className="text-3xl font-medium text-white mb-2">
        Season Prizes
      </h1>
      <p className="text-sm text-white/40 mb-8">
        Set the end-of-season prize structure for each league
      </p>

      {/* League tabs */}
      <div className="flex gap-2 mb-8">
        {LEAGUES.map(l => (
          <button
            key={l.key}
            onClick={() => setActiveLeague(l.key)}
            className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors ${
              activeLeague === l.key
                ? 'bg-purple-900 text-white'
                : 'bg-purple-900/10 text-white/40 hover:text-white/60'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* Add prize form */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-white/30 mb-6">
            Add Prize
          </h2>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-white/50 mb-2">
                  Position From *
                </label>
                <input
                  type="number"
                  value={form.position_from}
                  onChange={e => setForm({ ...form, position_from: e.target.value })}
                  placeholder="e.g. 1"
                  className="w-full bg-[#0a0814] border border-purple-900/40 text-white px-3 py-2 rounded text-sm placeholder:text-white/20 focus:outline-none focus:border-[#D4AF37]/50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-white/50 mb-2">
                  Position To
                </label>
                <input
                  type="number"
                  value={form.position_to}
                  onChange={e => setForm({ ...form, position_to: e.target.value })}
                  placeholder="Leave blank if single"
                  className="w-full bg-[#0a0814] border border-purple-900/40 text-white px-3 py-2 rounded text-sm placeholder:text-white/20 focus:outline-none focus:border-[#D4AF37]/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-white/50 mb-2">
                Prize Description *
              </label>
              <input
                value={form.prize_description}
                onChange={e => setForm({ ...form, prize_description: e.target.value })}
                placeholder="e.g. £5,000 or GUKPT Main Event Seat"
                className="w-full bg-[#0a0814] border border-purple-900/40 text-white px-3 py-2 rounded text-sm placeholder:text-white/20 focus:outline-none focus:border-[#D4AF37]/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-white/50 mb-2">
                Prize Amount (£) — optional
              </label>
              <input
                type="number"
                value={form.prize_amount}
                onChange={e => setForm({ ...form, prize_amount: e.target.value })}
                placeholder="e.g. 5000"
                className="w-full bg-[#0a0814] border border-purple-900/40 text-white px-3 py-2 rounded text-sm placeholder:text-white/20 focus:outline-none focus:border-[#D4AF37]/50"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !form.position_from || !form.prize_description}
              className={`px-6 py-3 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                form.position_from && form.prize_description && !saving
                  ? 'bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90'
                  : 'bg-[#D4AF37]/20 text-white/40 cursor-not-allowed'
              }`}
            >
              {saving ? 'Saving...' : 'Add Prize'}
            </button>

            {message && (
              <div className={`px-4 py-3 rounded text-sm ${
                message.type === 'success'
                  ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}>
                {message.text}
              </div>
            )}
          </div>
        </div>

        {/* Current prizes */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-white/30 mb-6">
            Current Prizes
          </h2>
          {loading ? (
            <div className="text-sm text-white/30">Loading...</div>
          ) : leaguePrizes.length === 0 ? (
            <div className="text-sm text-white/30 italic">
              No prizes set for this league yet
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {leaguePrizes
                .sort((a, b) => a.position_from - b.position_from)
                .map(prize => (
                  <div key={prize.id} className="bg-[#0a0814] border border-purple-900/25 rounded p-4 flex justify-between items-center">
                    <div>
                      <div className="text-xs text-white/50 mb-1">
                        {prize.position_from === prize.position_to
                          ? `Position ${prize.position_from}`
                          : `Positions ${prize.position_from} – ${prize.position_to}`}
                      </div>
                      <div className="text-sm font-medium text-[#D4AF37]">
                        {prize.prize_description}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(prize.id)}
                      disabled={deleting === prize.id}
                      className="bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-1 rounded text-xs hover:bg-red-500/20 transition-colors disabled:opacity-50"
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