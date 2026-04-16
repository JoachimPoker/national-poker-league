'use client'
import { useState, useEffect } from 'react'

export default function AdminNewsPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [form, setForm] = useState({ title: '', content: '', social_link: '' })
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => { fetchPosts() }, [])

  async function fetchPosts() {
    const res = await fetch('/api/admin/news')
    const data = await res.json()
    setPosts(data.posts || [])
    setLoading(false)
  }

  async function handleSave() {
    if (!form.title.trim()) return
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to save')
      setForm({ title: '', content: '', social_link: '' })
      setMessage({ type: 'success', text: 'Post published successfully!' })
      fetchPosts()
    } catch {
      setMessage({ type: 'error', text: 'Failed to save post' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    setDeleting(id)
    await fetch(`/api/admin/news?id=${id}`, { method: 'DELETE' })
    fetchPosts()
    setDeleting(null)
  }

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 500, color: 'var(--cream)', marginBottom: '8px' }}>
        News & Announcements
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '40px' }}>
        Write posts or share social media links to keep players updated
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>

        {/* New post form */}
        <div>
          <h2 style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-dimmest)', marginBottom: '20px' }}>
            New Post
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-dimmer)', marginBottom: '8px' }}>
                Title *
              </label>
              <input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Week 12 results uploaded"
                style={{
                  width: '100%', background: '#0a0814',
                  border: '1px solid rgba(122,33,100,0.4)',
                  color: 'var(--cream)', padding: '10px 14px',
                  borderRadius: '4px', fontSize: '13px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-dimmer)', marginBottom: '8px' }}>
                Content
              </label>
              <textarea
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                placeholder="Write your announcement here..."
                rows={5}
                style={{
                  width: '100%', background: '#0a0814',
                  border: '1px solid rgba(122,33,100,0.4)',
                  color: 'var(--cream)', padding: '10px 14px',
                  borderRadius: '4px', fontSize: '13px',
                  resize: 'vertical', fontFamily: 'inherit',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-dimmer)', marginBottom: '8px' }}>
                Social Media Link (optional)
              </label>
              <input
                value={form.social_link}
                onChange={e => setForm({ ...form, social_link: e.target.value })}
                placeholder="https://facebook.com/..."
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
              disabled={saving || !form.title.trim()}
              style={{
                background: form.title.trim() && !saving ? 'var(--plum)' : 'rgba(122,33,100,0.2)',
                border: 'none', color: 'var(--cream)',
                padding: '12px 24px', borderRadius: '4px',
                fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
                cursor: form.title.trim() && !saving ? 'pointer' : 'not-allowed',
                fontWeight: 500,
              }}
            >
              {saving ? 'Publishing...' : 'Publish Post'}
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

        {/* Existing posts */}
        <div>
          <h2 style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-dimmest)', marginBottom: '20px' }}>
            Published Posts
          </h2>

          {loading ? (
            <div style={{ fontSize: '13px', color: 'var(--text-dimmest)' }}>Loading...</div>
          ) : posts.length === 0 ? (
            <div style={{ fontSize: '13px', color: 'var(--text-dimmest)', fontStyle: 'italic' }}>
              No posts yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {posts.map(post => (
                <div key={post.id} style={{
                  background: '#0a0814',
                  border: '1px solid rgba(122,33,100,0.25)',
                  borderRadius: '4px', padding: '16px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--cream)', flex: 1, paddingRight: '12px' }}>
                      {post.title}
                    </div>
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={deleting === post.id}
                      style={{
                        background: 'rgba(200,0,0,0.1)', border: '1px solid rgba(200,0,0,0.2)',
                        color: '#f87171', padding: '4px 10px', borderRadius: '4px',
                        fontSize: '11px', cursor: 'pointer', flexShrink: 0,
                      }}
                    >
                      {deleting === post.id ? '...' : 'Delete'}
                    </button>
                  </div>
                  {post.content && (
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '6px', lineHeight: 1.5 }}>
                      {post.content}
                    </div>
                  )}
                  {post.social_link && (
                    <a href={post.social_link} target="_blank" rel="noopener noreferrer" style={{
                      fontSize: '11px', color: 'var(--gold)',
                    }}>
                      {post.social_link}
                    </a>
                  )}
                  <div style={{ fontSize: '10px', color: 'var(--text-dimmest)', marginTop: '8px' }}>
                    {new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}