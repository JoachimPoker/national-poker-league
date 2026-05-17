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
    <div className="animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="mb-10 relative">
        <div className="flex items-center gap-4 mb-3">
          <span className="h-[2px] w-8 bg-gradient-to-r from-transparent to-purple-400"></span>
          <span className="text-purple-400 text-[10px] tracking-[5px] uppercase font-black">
            Admin • News Desk
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-wider mb-2">
          News <span className="text-[#D4AF37]">& Announcements</span>
        </h1>
        <p className="text-xs text-white/50 font-mono tracking-widest uppercase">
          Write posts or share social links to keep players updated
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">

        {/* New Post Form */}
        <div className="bg-black/40 border border-white/10 rounded-2xl p-8 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-[40px] pointer-events-none"></div>

          <h2 className="text-[11px] font-black text-white/60 tracking-[4px] uppercase mb-6 border-b border-white/10 pb-4 relative z-10">
            New Post
          </h2>

          <div className="flex flex-col gap-5 relative z-10">

            <div>
              <label className="block text-[10px] text-white/40 tracking-[2px] uppercase font-black mb-2">
                Title *
              </label>
              <input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Week 12 results uploaded"
                className="w-full bg-black/60 border border-white/10 text-white px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-cyan-400/50 focus:shadow-[0_0_15px_rgba(0,243,255,0.15)] transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] text-white/40 tracking-[2px] uppercase font-black mb-2">
                Content
              </label>
              <textarea
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                placeholder="Write your announcement here..."
                rows={5}
                className="w-full bg-black/60 border border-white/10 text-white px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-cyan-400/50 focus:shadow-[0_0_15px_rgba(0,243,255,0.15)] transition-all resize-y font-sans"
              />
            </div>

            <div>
              <label className="block text-[10px] text-white/40 tracking-[2px] uppercase font-black mb-2">
                Social Media Link <span className="text-white/30 normal-case tracking-normal">(optional)</span>
              </label>
              <input
                value={form.social_link}
                onChange={e => setForm({ ...form, social_link: e.target.value })}
                placeholder="https://facebook.com/..."
                className="w-full bg-black/60 border border-white/10 text-white px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-cyan-400/50 focus:shadow-[0_0_15px_rgba(0,243,255,0.15)] transition-all"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !form.title.trim()}
              className={`py-3 px-6 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all shadow-lg ${
                form.title.trim() && !saving
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                  : 'bg-white/5 text-white/30 cursor-not-allowed'
              }`}
            >
              {saving ? 'Publishing...' : 'Publish Post'}
            </button>

            {message && (
              <div className={`rounded-lg p-4 text-sm font-medium ${
                message.type === 'success'
                  ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {message.text}
              </div>
            )}

          </div>
        </div>

        {/* Published Posts */}
        <div>
          <h2 className="text-[11px] font-black text-white/60 tracking-[4px] uppercase mb-6 border-b border-white/10 pb-4 flex items-center gap-3">
            Published Posts
            {posts.length > 0 && (
              <span className="px-2 py-0.5 rounded bg-purple-400/20 text-purple-400 text-xs normal-case tracking-normal">
                {posts.length}
              </span>
            )}
          </h2>

          {loading ? (
            <div className="text-sm text-white/40 font-mono tracking-widest uppercase">Loading...</div>
          ) : posts.length === 0 ? (
            <div className="bg-black/40 border border-dashed border-white/10 rounded-2xl p-12 text-center">
              <div className="text-4xl mb-4 opacity-20">📰</div>
              <div className="text-white/40 font-bold uppercase tracking-widest text-sm">
                No posts yet
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {posts.map(post => (
                <div
                  key={post.id}
                  className="group bg-black/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md hover:border-purple-500/30 hover:shadow-[0_10px_30px_rgba(168,85,247,0.1)] transition-all relative overflow-hidden"
                >
                  <div className="flex justify-between items-start gap-4 mb-2 relative z-10">
                    <h3 className="text-sm font-black text-white leading-snug flex-1">
                      {post.title}
                    </h3>
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={deleting === post.id}
                      className="flex-shrink-0 px-3 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded text-red-400 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                    >
                      {deleting === post.id ? '...' : 'Delete'}
                    </button>
                  </div>

                  {post.content && (
                    <p className="text-xs text-white/60 leading-relaxed mb-3 relative z-10">
                      {post.content}
                    </p>
                  )}

                  {post.social_link && (
                    
                      <a href={post.social_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-[11px] text-cyan-400 hover:text-cyan-300 font-mono truncate max-w-full relative z-10 transition-colors"
                    >
                      {post.social_link} ↗
                    </a>
                  )}

                  <div className="text-[9px] text-white/30 font-mono tracking-widest uppercase mt-3 pt-3 border-t border-white/5 relative z-10">
                    {new Date(post.published_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
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