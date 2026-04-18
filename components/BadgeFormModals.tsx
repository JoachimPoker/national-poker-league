'use client'
import { useState } from 'react'
import BadgeIconPicker from './BadgeIconPicker'

interface BadgeDefinition {
  id?: number
  key: string
  name: string
  description: string
  icon: string
  tier: 'bronze' | 'silver' | 'gold' | 'purple'
  category: string
  condition_type: string
  condition_value: any
  is_active?: boolean
}

const TIER_OPTIONS = [
  { value: 'bronze', label: 'Bronze', color: 'bg-amber-700/20 border-amber-600/30 text-amber-500' },
  { value: 'silver', label: 'Silver', color: 'bg-gray-400/20 border-gray-400/30 text-gray-300' },
  { value: 'gold', label: 'Gold', color: 'bg-yellow-500/20 border-yellow-400/30 text-yellow-400' },
  { value: 'purple', label: 'Purple', color: 'bg-purple-500/20 border-purple-400/30 text-purple-400' }
]

const CATEGORY_OPTIONS = [
  'Wins',
  'Cashes',
  'Money',
  'Final Tables',
  'Events Played',
  'Special'
]

const CONDITION_TYPES = [
  { value: 'wins', label: 'Total Wins' },
  { value: 'cashes', label: 'Total Cashes' },
  { value: 'money', label: 'Total Prize Money' },
  { value: 'final_tables', label: 'Final Tables' },
  { value: 'events', label: 'Events Played' },
  { value: 'manual', label: 'Manual Award Only' }
]

export function CreateBadgeModal({ 
  onClose, 
  onSuccess 
}: { 
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState<BadgeDefinition>({
    key: '',
    name: '',
    description: '',
    icon: '🏆',
    tier: 'bronze',
    category: 'Wins',
    condition_type: 'wins',
    condition_value: { min: 1 }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [useCustomImage, setUseCustomImage] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.key.trim()) {
      setError('Badge key is required')
      return
    }
    if (!formData.name.trim()) {
      setError('Badge name is required')
      return
    }
    if (!formData.description.trim()) {
      setError('Description is required')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (data.success) {
        onSuccess()
      } else {
        setError(data.error || 'Failed to create badge')
      }
    } catch (err) {
      setError('Failed to create badge')
    } finally {
      setLoading(false)
    }
  }

  const generateKey = () => {
    const key = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
    setFormData({ ...formData, key })
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-6 overflow-y-auto">
      <div className="bg-[#0a0a0f] border border-white/20 rounded-2xl p-4 md:p-8 max-w-3xl w-full my-8 max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-black uppercase">Create New Badge</h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/80 text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-400/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Preview Card */}
          <div className="glass-panel p-6 rounded-2xl border-t border-cyan-400/20">
            <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-4">
              Preview
            </div>
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-xl bg-black/40 border border-white/20 flex items-center justify-center text-5xl flex-shrink-0 overflow-hidden">
                {useCustomImage && formData.icon.startsWith('http') ? (
                  <img src={formData.icon} alt="Badge icon" className="w-full h-full object-cover" />
                ) : (
                  formData.icon
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-xl font-black text-white uppercase tracking-wider">
                    {formData.name || 'Badge Name'}
                  </h3>
                  <span className={`px-3 py-1 rounded text-xs font-black uppercase tracking-widest border ${
                    TIER_OPTIONS.find(t => t.value === formData.tier)?.color
                  }`}>
                    {formData.tier}
                  </span>
                </div>
                <p className="text-sm text-white/60">
                  {formData.description || 'Badge description will appear here...'}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-white/60">
                    {formData.category}
                  </span>
                  {formData.key && (
                    <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-white/60 font-mono">
                      {formData.key}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Badge Name */}
            <div>
              <label className="block text-sm font-bold text-white/80 mb-2">
                Badge Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-cyan-400/50 focus:outline-none transition-all"
                placeholder="e.g., First Blood"
                required
              />
            </div>

            {/* Badge Key */}
            <div>
              <label className="block text-sm font-bold text-white/80 mb-2">
                Badge Key *
                <button
                  type="button"
                  onClick={generateKey}
                  className="ml-2 text-xs text-cyan-400 hover:text-cyan-300 underline"
                >
                  Auto-generate
                </button>
              </label>
              <input
                type="text"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-cyan-400/50 focus:outline-none transition-all font-mono"
                placeholder="e.g., first_blood"
                required
              />
              <p className="text-xs text-white/40 mt-1">Unique identifier (lowercase, underscores only)</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-white/80 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-cyan-400/50 focus:outline-none transition-all resize-none"
              placeholder="e.g., Win your first tournament"
              rows={3}
              required
            />
          </div>

          {/* Icon, Tier, Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Icon Picker */}
            <BadgeIconPicker
              value={formData.icon}
              onChange={(icon) => {
                setUseCustomImage(icon.startsWith('http'))
                setFormData({ ...formData, icon })
              }}
              useCustomImage={useCustomImage}
              onImageUpload={async (file: File) => {
                setError('')
                try {
                  const uploadFormData = new FormData()
                  uploadFormData.append('file', file)

                  const res = await fetch('/api/upload-badge-image', {
                    method: 'POST',
                    body: uploadFormData
                  })

                  const data = await res.json()

                  if (data.success) {
                    setUseCustomImage(true)
                    setFormData({ ...formData, icon: data.url })
                  } else {
                    setError(data.error || 'Failed to upload image')
                    throw new Error(data.error)
                  }
                } catch (err: any) {
                  setError(err.message || 'Failed to upload image')
                  throw err
                }
              }}
            />

            {/* Tier */}
            <div>
              <label className="block text-sm font-bold text-white/80 mb-2">
                Tier *
              </label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value as any })}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:border-cyan-400/50 focus:outline-none transition-all"
                required
              >
                {TIER_OPTIONS.map((tier) => (
                  <option key={tier.value} value={tier.value}>
                    {tier.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-white/80 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:border-cyan-400/50 focus:outline-none transition-all"
                required
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Condition Builder */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-sm font-black text-white/80 uppercase tracking-wider mb-4">
              Unlock Condition
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Condition Type */}
              <div>
                <label className="block text-sm font-bold text-white/80 mb-2">
                  Condition Type *
                </label>
                <select
                  value={formData.condition_type}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    condition_type: e.target.value,
                    condition_value: e.target.value === 'manual' ? {} : { min: 1 }
                  })}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:border-cyan-400/50 focus:outline-none transition-all"
                  required
                >
                  {CONDITION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Condition Value */}
              {formData.condition_type !== 'manual' && (
                <div>
                  <label className="block text-sm font-bold text-white/80 mb-2">
                    {formData.condition_type === 'money' ? 'Minimum £' : 'Minimum Count'}
                  </label>
                  <input
                    type="number"
                    value={formData.condition_value?.min || 0}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      condition_value: { min: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:border-cyan-400/50 focus:outline-none transition-all"
                    min="0"
                    required
                  />
                </div>
              )}
            </div>

            {formData.condition_type === 'manual' && (
              <p className="text-sm text-white/60 mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                This badge can only be awarded manually by admins. No automatic unlock condition.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-bold transition-all"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 hover:border-cyan-400/50 rounded-lg text-cyan-400 font-bold transition-all disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Badge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function EditBadgeModal({ 
  badge, 
  onClose, 
  onSuccess 
}: { 
  badge: BadgeDefinition
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState<BadgeDefinition>(badge)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [useCustomImage, setUseCustomImage] = useState(badge.icon.startsWith('http'))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    setLoading(true)
    try {
      const res = await fetch('/api/admin/badges', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: badge.id,
          updates: {
            name: formData.name,
            description: formData.description,
            icon: formData.icon,
            tier: formData.tier,
            category: formData.category,
            condition_type: formData.condition_type,
            condition_value: formData.condition_value
          }
        })
      })

      const data = await res.json()

      if (data.success) {
        onSuccess()
      } else {
        setError(data.error || 'Failed to update badge')
      }
    } catch (err) {
      setError('Failed to update badge')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-6 overflow-y-auto">
      <div className="bg-[#0a0a0f] border border-white/20 rounded-2xl p-4 md:p-8 max-w-3xl w-full my-8 max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-black uppercase truncate">Edit Badge: {badge.name}</h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/80 text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-400/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Preview Card */}
          <div className="glass-panel p-6 rounded-2xl border-t border-cyan-400/20">
            <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-4">
              Preview
            </div>
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-xl bg-black/40 border border-white/20 flex items-center justify-center text-5xl flex-shrink-0 overflow-hidden">
                {useCustomImage && formData.icon.startsWith('http') ? (
                  <img src={formData.icon} alt="Badge icon" className="w-full h-full object-cover" />
                ) : (
                  formData.icon
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-xl font-black text-white uppercase tracking-wider">
                    {formData.name}
                  </h3>
                  <span className={`px-3 py-1 rounded text-xs font-black uppercase tracking-widest border ${
                    TIER_OPTIONS.find(t => t.value === formData.tier)?.color
                  }`}>
                    {formData.tier}
                  </span>
                </div>
                <p className="text-sm text-white/60">
                  {formData.description}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-white/60">
                    {formData.category}
                  </span>
                  <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-white/60 font-mono">
                    {formData.key}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Badge Name */}
            <div>
              <label className="block text-sm font-bold text-white/80 mb-2">
                Badge Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-cyan-400/50 focus:outline-none transition-all"
                required
              />
            </div>

            {/* Badge Key (read-only) */}
            <div>
              <label className="block text-sm font-bold text-white/80 mb-2">
                Badge Key (Cannot Change)
              </label>
              <input
                type="text"
                value={formData.key}
                className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-lg text-white/60 font-mono cursor-not-allowed"
                disabled
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-white/80 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-cyan-400/50 focus:outline-none transition-all resize-none"
              rows={3}
              required
            />
          </div>

          {/* Icon, Tier, Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Icon Picker */}
            <BadgeIconPicker
              value={formData.icon}
              onChange={(icon) => {
                setUseCustomImage(icon.startsWith('http'))
                setFormData({ ...formData, icon })
              }}
              useCustomImage={useCustomImage}
              onImageUpload={async (file: File) => {
                setError('')
                try {
                  const uploadFormData = new FormData()
                  uploadFormData.append('file', file)

                  const res = await fetch('/api/upload-badge-image', {
                    method: 'POST',
                    body: uploadFormData
                  })

                  const data = await res.json()

                  if (data.success) {
                    setUseCustomImage(true)
                    setFormData({ ...formData, icon: data.url })
                  } else {
                    setError(data.error || 'Failed to upload image')
                    throw new Error(data.error)
                  }
                } catch (err: any) {
                  setError(err.message || 'Failed to upload image')
                  throw err
                }
              }}
            />

            {/* Tier */}
            <div>
              <label className="block text-sm font-bold text-white/80 mb-2">
                Tier *
              </label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value as any })}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:border-cyan-400/50 focus:outline-none transition-all"
                required
              >
                {TIER_OPTIONS.map((tier) => (
                  <option key={tier.value} value={tier.value}>
                    {tier.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-white/80 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:border-cyan-400/50 focus:outline-none transition-all"
                required
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Condition Builder */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-sm font-black text-white/80 uppercase tracking-wider mb-4">
              Unlock Condition
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Condition Type */}
              <div>
                <label className="block text-sm font-bold text-white/80 mb-2">
                  Condition Type *
                </label>
                <select
                  value={formData.condition_type}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    condition_type: e.target.value,
                    condition_value: e.target.value === 'manual' ? {} : { min: formData.condition_value?.min || 1 }
                  })}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:border-cyan-400/50 focus:outline-none transition-all"
                  required
                >
                  {CONDITION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Condition Value */}
              {formData.condition_type !== 'manual' && (
                <div>
                  <label className="block text-sm font-bold text-white/80 mb-2">
                    {formData.condition_type === 'money' ? 'Minimum £' : 'Minimum Count'}
                  </label>
                  <input
                    type="number"
                    value={formData.condition_value?.min || 0}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      condition_value: { min: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:border-cyan-400/50 focus:outline-none transition-all"
                    min="0"
                    required
                  />
                </div>
              )}
            </div>

            {formData.condition_type === 'manual' && (
              <p className="text-sm text-white/60 mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                This badge can only be awarded manually by admins. No automatic unlock condition.
              </p>
            )}
          </div>

          {/* Warning about changing conditions */}
          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-400/30 text-orange-400 text-sm">
            <strong>⚠️ Note:</strong> Changing badge conditions will not automatically recalculate existing player badges. You may need to run "Recalculate All Badges" after making changes.
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-bold transition-all"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 hover:border-cyan-400/50 rounded-lg text-cyan-400 font-bold transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}