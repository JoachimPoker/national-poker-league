'use client'
import { useState, useEffect } from 'react'

interface ArchivedBadge {
  id: number
  badge_key: string
  badge_name: string
  badge_description: string
  badge_icon: string
  badge_tier: string
  badge_category: string
  player_count: number
  archived_at: string
  archived_by: string
  reason: string
}

export default function BadgeArchiveManager() {
  const [archivedBadges, setArchivedBadges] = useState<ArchivedBadge[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchArchivedBadges()
  }, [])

  const fetchArchivedBadges = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/badge-archive')
      const data = await res.json()
      setArchivedBadges(data.archivedBadges || [])
    } catch (error) {
      console.error('Failed to fetch archived badges:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (badgeKey: string) => {
    if (!confirm('Restore this badge? It will become active again and previous player badges will be restored.')) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/badge-archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'restore', 
          badgeKey 
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setMessage(`✅ ${data.message}`)
        fetchArchivedBadges()
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Failed to restore badge')
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleHardDelete = async (badgeKey: string, badgeName: string) => {
    if (!confirm(`⚠️ PERMANENTLY DELETE "${badgeName}"?\n\nThis will:\n- Remove the badge definition forever\n- Delete all archived player badge records\n- Cannot be undone\n\nType the badge name to confirm:`)) {
      return
    }

    const confirmation = prompt(`Type "${badgeName}" to confirm permanent deletion:`)
    if (confirmation !== badgeName) {
      alert('Badge name did not match. Deletion cancelled.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/badge-archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'hard_delete', 
          badgeKey 
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setMessage(`✅ ${data.message}`)
        fetchArchivedBadges()
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Failed to delete badge')
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">
            Badge Archive
          </h2>
          <p className="text-sm text-white/60 mt-1">
            Archived badges and their player records. You can restore or permanently delete them.
          </p>
        </div>
        <button
          onClick={fetchArchivedBadges}
          disabled={loading}
          className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 rounded-lg text-cyan-400 text-sm font-bold transition-all disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-sm font-mono">
          {message}
        </div>
      )}

      {archivedBadges.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center">
          <div className="text-6xl mb-4 opacity-20">🗄️</div>
          <div className="text-white/60 font-bold">No archived badges</div>
          <div className="text-white/40 text-sm mt-2">Archived badges will appear here</div>
        </div>
      ) : (
        <div className="space-y-4">
          {archivedBadges.map((badge) => (
            <div 
              key={badge.id} 
              className="glass-panel p-6 rounded-2xl hover:border-white/20 transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Badge Icon */}
                <div className="w-16 h-16 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-3xl flex-shrink-0">
                  {badge.badge_icon}
                </div>

                {/* Badge Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="text-lg font-black text-white uppercase tracking-wider">
                        {badge.badge_name}
                      </h3>
                      <p className="text-sm text-white/60 mt-1">
                        {badge.badge_description}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-3 py-1 rounded text-xs font-black uppercase tracking-widest border ${
                        badge.badge_tier === 'purple' ? 'bg-purple-500/20 border-purple-400/30 text-purple-400' :
                        badge.badge_tier === 'gold' ? 'bg-yellow-500/20 border-yellow-400/30 text-yellow-400' :
                        badge.badge_tier === 'silver' ? 'bg-gray-400/20 border-gray-400/30 text-gray-300' :
                        'bg-amber-700/20 border-amber-600/30 text-amber-500'
                      }`}>
                        {badge.badge_tier}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Category</div>
                      <div className="text-sm text-white/80">{badge.badge_category}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Players Affected</div>
                      <div className="text-sm text-white/80">{badge.player_count}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Archived By</div>
                      <div className="text-sm text-white/80">{badge.archived_by}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Archived Date</div>
                      <div className="text-sm text-white/80">
                        {new Date(badge.archived_at).toLocaleDateString('en-GB', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>

                  {badge.reason && (
                    <div className="mb-4">
                      <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Reason</div>
                      <div className="text-sm text-white/60 italic">"{badge.reason}"</div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleRestore(badge.badge_key)}
                      disabled={loading}
                      className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 hover:border-cyan-400/50 rounded-lg text-cyan-400 text-sm font-bold transition-all disabled:opacity-50"
                    >
                      Restore Badge
                    </button>
                    <button
                      onClick={() => handleHardDelete(badge.badge_key, badge.badge_name)}
                      disabled={loading}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 hover:border-red-400/50 rounded-lg text-red-400 text-sm font-bold transition-all disabled:opacity-50"
                    >
                      Permanently Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}