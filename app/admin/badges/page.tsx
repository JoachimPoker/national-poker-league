'use client'
import { useState, useEffect } from 'react'
import { CreateBadgeModal, EditBadgeModal } from '@/components/BadgeFormModals'

interface BadgeDefinition {
  id: number
  key: string
  name: string
  description: string
  icon: string
  tier: 'bronze' | 'silver' | 'gold' | 'purple'
  category: string
  condition_type: string
  condition_value: any
  is_active: boolean
}

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

type TabType = 'active' | 'archived' | 'create'

export default function BadgeManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>('active')
  const [activeBadges, setActiveBadges] = useState<BadgeDefinition[]>([])
  const [archivedBadges, setArchivedBadges] = useState<ArchivedBadge[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [editingBadge, setEditingBadge] = useState<BadgeDefinition | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    fetchActiveBadges()
    fetchArchivedBadges()
  }, [])

  const fetchActiveBadges = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/badges')
      const data = await res.json()
      setActiveBadges(data.badges || [])
    } catch (error) {
      console.error('Failed to fetch badges:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchArchivedBadges = async () => {
    try {
      const res = await fetch('/api/admin/badge-archive')
      const data = await res.json()
      setArchivedBadges(data.archivedBadges || [])
    } catch (error) {
      console.error('Failed to fetch archived badges:', error)
    }
  }

  const handleArchive = async (badge: BadgeDefinition) => {
    const reason = prompt(`Why are you archiving "${badge.name}"?`)
    if (reason === null) return // Cancelled

    setLoading(true)
    try {
      const res = await fetch('/api/admin/badge-archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'archive',
          badgeKey: badge.key,
          reason,
          archivedBy: 'Admin' // TODO: Get actual admin user
        })
      })

      const data = await res.json()

      if (data.success) {
        setMessage(`✅ ${data.message}`)
        fetchActiveBadges()
        fetchArchivedBadges()
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Failed to archive badge')
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(''), 5000)
    }
  }

  const handleRestore = async (badgeKey: string) => {
    if (!confirm('Restore this badge? It will become active again.')) return

    setLoading(true)
    try {
      const res = await fetch('/api/admin/badge-archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore', badgeKey })
      })

      const data = await res.json()

      if (data.success) {
        setMessage(`✅ ${data.message}`)
        fetchActiveBadges()
        fetchArchivedBadges()
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Failed to restore badge')
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(''), 5000)
    }
  }

  const handleHardDelete = async (badgeKey: string, badgeName: string) => {
    const confirmation = prompt(`⚠️ PERMANENTLY DELETE "${badgeName}"?\n\nType the badge name to confirm:`)
    if (confirmation !== badgeName) {
      alert('Badge name did not match. Deletion cancelled.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/badge-archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'hard_delete', badgeKey })
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
      setTimeout(() => setMessage(''), 5000)
    }
  }

  const handleEdit = (badge: BadgeDefinition) => {
    setEditingBadge(badge)
    setShowEditModal(true)
  }

  const handleDelete = async (badge: BadgeDefinition) => {
    if (!confirm(`Delete "${badge.name}"? This will archive it (can be restored later).`)) return
    await handleArchive(badge)
  }

  return (
    <div className="min-h-screen bg-[#040408] text-white p-6 md:p-12">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">
            Badge Management
          </h1>
          <p className="text-white/60">
            Create, edit, archive, and manage all achievement badges
          </p>
        </div>

        {/* Message Banner */}
        {message && (
          <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10 text-sm font-mono">
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-3 font-bold uppercase tracking-wider text-sm transition-all relative ${
              activeTab === 'active'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            Active Badges
            <span className="ml-2 px-2 py-0.5 rounded bg-cyan-400/20 text-cyan-400 text-xs">
              {activeBadges.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`px-6 py-3 font-bold uppercase tracking-wider text-sm transition-all relative ${
              activeTab === 'archived'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            Archived
            <span className="ml-2 px-2 py-0.5 rounded bg-purple-400/20 text-purple-400 text-xs">
              {archivedBadges.length}
            </span>
          </button>
          <button
            onClick={() => { setActiveTab('create'); setShowCreateModal(true); }}
            className={`px-6 py-3 font-bold uppercase tracking-wider text-sm transition-all relative ${
              activeTab === 'create'
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            + Create New
          </button>
        </div>

        {/* Active Badges Tab */}
        {activeTab === 'active' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-white/80 uppercase tracking-wider">
                Active Badges ({activeBadges.length})
              </h2>
              <button
                onClick={fetchActiveBadges}
                disabled={loading}
                className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 rounded-lg text-cyan-400 text-sm font-bold transition-all disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {activeBadges.length === 0 ? (
              <div className="glass-panel p-12 rounded-2xl text-center">
                <div className="text-6xl mb-4 opacity-20">🏆</div>
                <div className="text-white/60 font-bold">No active badges</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {activeBadges.map((badge) => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    onEdit={handleEdit}
                    onArchive={handleArchive}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Archived Badges Tab */}
        {activeTab === 'archived' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-white/80 uppercase tracking-wider">
                Archived Badges ({archivedBadges.length})
              </h2>
              <button
                onClick={fetchArchivedBadges}
                disabled={loading}
                className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 rounded-lg text-purple-400 text-sm font-bold transition-all disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {archivedBadges.length === 0 ? (
              <div className="glass-panel p-12 rounded-2xl text-center">
                <div className="text-6xl mb-4 opacity-20">🗄️</div>
                <div className="text-white/60 font-bold">No archived badges</div>
                <div className="text-white/40 text-sm mt-2">Archived badges will appear here</div>
              </div>
            ) : (
              <div className="space-y-4">
                {archivedBadges.map((badge) => (
                  <ArchivedBadgeCard
                    key={badge.id}
                    badge={badge}
                    onRestore={handleRestore}
                    onHardDelete={handleHardDelete}
                    loading={loading}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateBadgeModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchActiveBadges()
            setShowCreateModal(false)
            setMessage('✅ Badge created successfully')
            setTimeout(() => setMessage(''), 5000)
          }}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && editingBadge && (
        <EditBadgeModal
          badge={editingBadge}
          onClose={() => {
            setShowEditModal(false)
            setEditingBadge(null)
          }}
          onSuccess={() => {
            fetchActiveBadges()
            setShowEditModal(false)
            setEditingBadge(null)
            setMessage('✅ Badge updated successfully')
            setTimeout(() => setMessage(''), 5000)
          }}
        />
      )}
    </div>
  )
}

// Badge Card Component
function BadgeCard({ 
  badge, 
  onEdit, 
  onArchive 
}: { 
  badge: BadgeDefinition
  onEdit: (badge: BadgeDefinition) => void
  onArchive: (badge: BadgeDefinition) => void
}) {
  const tierColors = {
    purple: 'bg-purple-500/20 border-purple-400/30 text-purple-400',
    gold: 'bg-yellow-500/20 border-yellow-400/30 text-yellow-400',
    silver: 'bg-gray-400/20 border-gray-400/30 text-gray-300',
    bronze: 'bg-amber-700/20 border-amber-600/30 text-amber-500'
  }

  return (
    <div className="glass-panel p-5 rounded-2xl hover:border-white/20 transition-all">
      <div className="flex items-start gap-4">
        {/* Badge Icon */}
        <div className="w-16 h-16 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-3xl flex-shrink-0">
          {badge.icon}
        </div>

        {/* Badge Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-lg font-black text-white uppercase tracking-wider">
              {badge.name}
            </h3>
            <span className={`px-2.5 py-1 rounded text-xs font-black uppercase tracking-widest border flex-shrink-0 ${tierColors[badge.tier]}`}>
              {badge.tier}
            </span>
          </div>

          <p className="text-sm text-white/60 mb-3 line-clamp-2">
            {badge.description}
          </p>

          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-white/60">
              {badge.category}
            </span>
            <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-white/60 font-mono">
              {badge.key}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(badge)}
              className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 hover:border-cyan-400/50 rounded text-cyan-400 text-xs font-bold transition-all"
            >
              Edit
            </button>
            <button
              onClick={() => onArchive(badge)}
              className="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-400/30 hover:border-orange-400/50 rounded text-orange-400 text-xs font-bold transition-all"
            >
              Archive
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Archived Badge Card Component
function ArchivedBadgeCard({
  badge,
  onRestore,
  onHardDelete,
  loading
}: {
  badge: ArchivedBadge
  onRestore: (key: string) => void
  onHardDelete: (key: string, name: string) => void
  loading: boolean
}) {
  const tierColors = {
    purple: 'bg-purple-500/20 border-purple-400/30 text-purple-400',
    gold: 'bg-yellow-500/20 border-yellow-400/30 text-yellow-400',
    silver: 'bg-gray-400/20 border-gray-400/30 text-gray-300',
    bronze: 'bg-amber-700/20 border-amber-600/30 text-amber-500'
  }

  return (
    <div className="glass-panel p-6 rounded-2xl opacity-70 hover:opacity-100 transition-all">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-3xl flex-shrink-0 grayscale">
          {badge.badge_icon}
        </div>

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
            <span className={`px-2.5 py-1 rounded text-xs font-black uppercase tracking-widest border flex-shrink-0 ${tierColors[badge.badge_tier as keyof typeof tierColors]}`}>
              {badge.badge_tier}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 mt-4">
            <div>
              <div className="text-[9px] text-white/40 uppercase tracking-widest font-bold mb-1">Category</div>
              <div className="text-sm text-white/80">{badge.badge_category}</div>
            </div>
            <div>
              <div className="text-[9px] text-white/40 uppercase tracking-widest font-bold mb-1">Players</div>
              <div className="text-sm text-white/80">{badge.player_count}</div>
            </div>
            <div>
              <div className="text-[9px] text-white/40 uppercase tracking-widest font-bold mb-1">Archived By</div>
              <div className="text-sm text-white/80">{badge.archived_by}</div>
            </div>
            <div>
              <div className="text-[9px] text-white/40 uppercase tracking-widest font-bold mb-1">Date</div>
              <div className="text-sm text-white/80">
                {new Date(badge.archived_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>

          {badge.reason && (
            <div className="mb-4 p-3 rounded-lg bg-black/20 border border-white/5">
              <div className="text-[9px] text-white/40 uppercase tracking-widest font-bold mb-1">Reason</div>
              <div className="text-sm text-white/60 italic">"{badge.reason}"</div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => onRestore(badge.badge_key)}
              disabled={loading}
              className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 hover:border-cyan-400/50 rounded-lg text-cyan-400 text-sm font-bold transition-all disabled:opacity-50"
            >
              Restore
            </button>
            <button
              onClick={() => onHardDelete(badge.badge_key, badge.badge_name)}
              disabled={loading}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 hover:border-red-400/50 rounded-lg text-red-400 text-sm font-bold transition-all disabled:opacity-50"
            >
              Permanently Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}