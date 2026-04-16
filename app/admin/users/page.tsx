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
      <h1 style={{ fontSize: '28px', fontWeight: 500, color: 'var(--cream)', marginBottom: '8px' }}>
        Admin Users
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '40px' }}>
        Manage who has access to the admin panel
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>

        {/* Add user form */}
        <div>
          <h2 style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-dimmest)', marginBottom: '20px' }}>
            Add Admin User
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { key: 'name', label: 'Full Name *', placeholder: 'e.g. John Smith', type: 'text' },
              { key: 'email', label: 'Email Address *', placeholder: 'e.g. john@example.com', type: 'email' },
              { key: 'password', label: 'Password *', placeholder: 'Minimum 8 characters', type: 'password' },
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

            <button
              onClick={handleSave}
              disabled={saving || !form.name || !form.email || !form.password}
              style={{
                background: form.name && form.email && form.password && !saving ? 'var(--plum)' : 'rgba(122,33,100,0.2)',
                border: 'none', color: 'var(--cream)',
                padding: '12px 24px', borderRadius: '4px',
                fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
                cursor: form.name && form.email && form.password && !saving ? 'pointer' : 'not-allowed',
                fontWeight: 500,
              }}
            >
              {saving ? 'Creating...' : 'Create Admin User'}
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

        {/* Current users */}
        <div>
          <h2 style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-dimmest)', marginBottom: '20px' }}>
            Current Admin Users
          </h2>
          {loading ? (
            <div style={{ fontSize: '13px', color: 'var(--text-dimmest)' }}>Loading...</div>
          ) : users.length === 0 ? (
            <div style={{ fontSize: '13px', color: 'var(--text-dimmest)', fontStyle: 'italic' }}>
              No admin users yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {users.map(user => (
                <div key={user.id} style={{
                  background: '#0a0814',
                  border: '1px solid rgba(122,33,100,0.25)',
                  borderRadius: '4px', padding: '14px 16px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--cream)', marginBottom: '3px' }}>
                      {user.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dimmest)' }}>
                      {user.email}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(user.id)}
                    disabled={deleting === user.id}
                    style={{
                      background: 'rgba(200,0,0,0.1)', border: '1px solid rgba(200,0,0,0.2)',
                      color: '#f87171', padding: '4px 10px', borderRadius: '4px',
                      fontSize: '11px', cursor: 'pointer',
                    }}
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