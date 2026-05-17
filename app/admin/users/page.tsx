'use client'
import { useState, useEffect } from 'react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    setUsers(data.users || [])
    setLoading(false)
  }

  async function handleSave() {
    if (!form.name || !form.email || !form.password) return
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setForm({ name: '', email: '', password: '' })
      setMessage({ type: 'success', text: 'Admin user created!' })
      fetchUsers()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    setDeleting(id)
    await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' })
    fetchUsers()
    setDeleting(null)
  }

  return (
    <div>
      <h1 className="text-3xl font-medium text-white mb-2">
        Admin Users
      </h1>
      <p className="text-sm text-white/40 mb-10">
        Manage who has access to the admin panel
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* Add user form */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-white/30 mb-6">
            Add Admin User
          </h2>
          <div className="flex flex-col gap-4">
            {[
              { key: 'name', label: 'Full Name *', placeholder: 'e.g. John Smith', type: 'text' },
              { key: 'email', label: 'Email Address *', placeholder: 'e.g. john@example.com', type: 'email' },
              { key: 'password', label: 'Password *', placeholder: 'Minimum 8 characters', type: 'password' },
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
                  className="w-full bg-[#0a0814] border border-purple-900/40 text-white px-3 py-2 rounded text-sm placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            ))}

            <button
              onClick={handleSave}
              disabled={saving || !form.name || !form.email || !form.password}
              className={`px-6 py-3 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                form.name && form.email && form.password && !saving
                  ? 'bg-emerald-500 text-black hover:bg-emerald-500/90'
                  : 'bg-emerald-500/20 text-white/40 cursor-not-allowed'
              }`}
            >
              {saving ? 'Creating...' : 'Create Admin User'}
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

        {/* Current users */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-white/30 mb-6">
            Current Admin Users
          </h2>
          {loading ? (
            <div className="text-sm text-white/30">Loading...</div>
          ) : users.length === 0 ? (
            <div className="text-sm text-white/30 italic">
              No admin users yet
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {users.map(user => (
                <div key={user.id} className="bg-[#0a0814] border border-purple-900/25 rounded p-4 flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium text-white mb-1">
                      {user.name}
                    </div>
                    <div className="text-xs text-white/40">
                      {user.email}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(user.id)}
                    disabled={deleting === user.id}
                    className="bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-1 rounded text-xs hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  >
                    {deleting === user.id ? '...' : 'Remove'}
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