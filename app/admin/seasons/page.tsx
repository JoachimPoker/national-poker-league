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
      <h1 className="text-3xl font-medium text-white mb-2">
        Seasons
      </h1>
      <p className="text-sm text-white/40 mb-10">
        Manage seasons and upload previous season data
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Add season */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-white/30 mb-6">
            Add Season
          </h2>
          <div className="flex flex-col gap-4">
            {[
              { key: 'name', label: 'Season Name *', placeholder: 'e.g. 2025 Season', type: 'text' },
              { key: 'year', label: 'Year *', placeholder: 'e.g. 2025', type: 'number' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-xs font-bold uppercase tracking-wide text-white/50 mb-2">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  value={form[field.key as keyof typeof form]}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full bg-[#0a0814] border border-purple-900/40 text-white px-3 py-2 rounded text-sm placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            ))}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-white/50 mb-2">
                NPL Points Rule *
              </label>
              <select
                value={form.npl_rule}
                onChange={e => setForm({ ...form, npl_rule: e.target.value })}
                className="w-full bg-[#0a0814] border border-purple-900/40 text-white px-3 py-2 rounded text-sm focus:outline-none focus:border-cyan-500/50"
              >
                {NPL_RULES.map(r => (
                  <option key={r.key} value={r.key}>{r.label}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !form.name || !form.year}
              className={`px-6 py-3 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                form.name && form.year && !saving
                  ? 'bg-cyan-500 text-black hover:bg-cyan-500/90'
                  : 'bg-cyan-500/20 text-white/40 cursor-not-allowed'
              }`}
            >
              {saving ? 'Creating...' : 'Create Season'}
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

        {/* Seasons list */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-white/30 mb-6">
            All Seasons
          </h2>
          {loading ? (
            <div className="text-sm text-white/30">Loading...</div>
          ) : (
            <div className="flex flex-col gap-2">
              {seasons.map(season => (
                <div key={season.id} className={`rounded p-4 flex justify-between items-center transition-colors ${
                  season.is_active
                    ? 'bg-[#0a0814] border border-[#D4AF37]/40'
                    : 'bg-[#0a0814] border border-purple-900/25'
                }`}>
                  <div>
                    <div className={`text-sm font-medium mb-1 ${season.is_active ? 'text-[#D4AF37]' : 'text-white'}`}>
                      {season.name}
                      {season.is_active && (
                        <span className="ml-2 text-xs bg-[#D4AF37] text-black px-2 py-0.5 rounded font-bold">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-white/40">
                      {NPL_RULES.find(r => r.key === season.npl_rule)?.label || season.npl_rule}
                    </div>
                  </div>
                  {!season.is_active && (
                    <button
                      onClick={() => setActive(season.id)}
                      className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] px-3 py-1 rounded text-xs font-medium hover:bg-[#D4AF37]/20 transition-colors"
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