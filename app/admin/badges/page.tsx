'use client'
import { useState, useEffect } from 'react'

type TabType = 'definitions' | 'awards'

const TIERS = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'legendary']
const CONDITION_TYPES = ['wins', 'cashes', 'events_played', 'prize_money', 'special', 'leaderboard', 'custom']

export default function AdminBadgesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('definitions')

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#ffffff', marginBottom: '8px' }}>
        Badge & Achievement Management
      </h1>
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '32px' }}>
        Create badge types, award them to players, and manage all achievements
      </p>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', borderBottom: '2px solid rgba(67,121,255,0.1)', paddingBottom: '2px' }}>
        <button
          onClick={() => setActiveTab('definitions')}
          style={{
            padding: '12px 24px',
            fontSize: '12px',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            fontWeight: 700,
            border: 'none',
            borderBottom: activeTab === 'definitions' ? '2px solid #4379FF' : '2px solid transparent',
            background: activeTab === 'definitions' ? 'rgba(67,121,255,0.1)' : 'transparent',
            color: activeTab === 'definitions' ? '#4379FF' : 'rgba(255,255,255,0.5)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginBottom: '-2px'
          }}
        >
          Badge Definitions
        </button>
        <button
          onClick={() => setActiveTab('awards')}
          style={{
            padding: '12px 24px',
            fontSize: '12px',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            fontWeight: 700,
            border: 'none',
            borderBottom: activeTab === 'awards' ? '2px solid #4379FF' : '2px solid transparent',
            background: activeTab === 'awards' ? 'rgba(67,121,255,0.1)' : 'transparent',
            color: activeTab === 'awards' ? '#4379FF' : 'rgba(255,255,255,0.5)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginBottom: '-2px'
          }}
        >
          Player Awards
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'definitions' && <BadgeDefinitionsTab />}
      {activeTab === 'awards' && <PlayerAwardsTab />}
    </div>
  )
}

// ============================================
// TAB 1: BADGE DEFINITIONS
// ============================================

function BadgeDefinitionsTab() {
  const [badges, setBadges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingBadge, setEditingBadge] = useState<any>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [uploadedFilename, setUploadedFilename] = useState<string>('')
  const [form, setForm] = useState({
    key: '',
    name: '',
    description: '',
    icon: '',
    image_url: '',
    tier: 'bronze',
    category: '',
    condition_type: 'wins',
    condition_value: '{"min": 1}',
    display_order: 999
  })

  useEffect(() => { fetchBadges() }, [])

  async function fetchBadges() {
    const res = await fetch('/api/admin/badge-definitions')
    const data = await res.json()
    setBadges(data.badges || [])
    setLoading(false)
  }

  function resetForm() {
    setForm({
      key: '',
      name: '',
      description: '',
      icon: '',
      image_url: '',
      tier: 'bronze',
      category: '',
      condition_type: 'wins',
      condition_value: '{"min": 1}',
      display_order: 999
    })
    setEditingBadge(null)
    setImagePreview('')
    setUploadedFilename('')
    setShowForm(false)
  }

  function handleEdit(badge: any) {
    setEditingBadge(badge)
    setForm({
      key: badge.key,
      name: badge.name,
      description: badge.description,
      icon: badge.icon || '',
      image_url: badge.image_url || '',
      tier: badge.tier,
      category: badge.category,
      condition_type: badge.condition_type,
      condition_value: JSON.stringify(badge.condition_value || {}),
      display_order: badge.display_order || 999
    })
    setImagePreview(badge.image_url || '')
    // Extract filename from URL if it's a local upload
    if (badge.image_url && badge.image_url.startsWith('/badges/')) {
      setUploadedFilename(badge.image_url.replace('/badges/', ''))
    }
    setShowForm(true)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Invalid file type. Please use PNG, JPG, WEBP, GIF, or SVG' })
      return
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File too large. Maximum size is 2MB' })
      return
    }

    setUploading(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/upload-badge-image', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setForm({ ...form, image_url: data.url, icon: '' })
      setImagePreview(data.url)
      setUploadedFilename(data.filename)
      setMessage({ type: 'success', text: 'Image uploaded successfully!' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setUploading(false)
    }
  }

  async function handleRemoveImage() {
    if (!uploadedFilename) return

    try {
      await fetch(`/api/admin/upload-badge-image?filename=${uploadedFilename}`, {
        method: 'DELETE'
      })
    } catch (err) {
      console.error('Failed to delete image:', err)
    }

    setForm({ ...form, image_url: '' })
    setImagePreview('')
    setUploadedFilename('')
  }

  async function handleSave() {
    if (!form.name || !form.description || !form.category) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' })
      return
    }

    if (!form.icon && !form.image_url) {
      setMessage({ type: 'error', text: 'Please provide either an emoji icon or image URL' })
      return
    }

    setSaving(true)
    setMessage(null)
    
    try {
      let conditionValue = {}
      try {
        conditionValue = JSON.parse(form.condition_value)
      } catch {
        throw new Error('Invalid JSON in condition value')
      }

      const payload = {
        ...form,
        condition_value: conditionValue
      }

      const url = editingBadge 
        ? `/api/admin/badge-definitions?id=${editingBadge.id}`
        : '/api/admin/badge-definitions'
      
      const method = editingBadge ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      
      setMessage({ 
        type: 'success', 
        text: editingBadge ? 'Badge updated successfully!' : 'Badge created successfully!' 
      })
      resetForm()
      fetchBadges()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(id: number, currentState: boolean) {
    await fetch('/api/admin/badge-definitions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !currentState })
    })
    fetchBadges()
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this badge definition? This cannot be undone.')) return
    
    await fetch(`/api/admin/badge-definitions?id=${id}`, { method: 'DELETE' })
    setMessage({ type: 'success', text: 'Badge deleted successfully' })
    fetchBadges()
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
            Define badge types and automatic earning conditions
          </p>
        </div>
        <button
          onClick={() => showForm ? resetForm() : setShowForm(true)}
          style={{
            background: showForm ? 'rgba(200,50,50,0.2)' : '#4379FF',
            border: showForm ? '1px solid rgba(200,50,50,0.4)' : 'none',
            color: '#ffffff',
            padding: '11px 24px',
            borderRadius: '4px',
            fontSize: '12px',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {showForm ? '✕ Cancel' : '+ New Badge'}
        </button>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '4px',
          marginBottom: '24px',
          background: message.type === 'success' ? 'rgba(0,180,80,0.1)' : 'rgba(200,50,50,0.1)',
          border: `1px solid ${message.type === 'success' ? 'rgba(0,180,80,0.25)' : 'rgba(200,50,50,0.25)'}`,
          fontSize: '13px',
          color: message.type === 'success' ? '#4ade80' : '#f87171',
        }}>
          {message.text}
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div style={{ background: '#0d0d2a', border: '1px solid rgba(67,121,255,0.2)', borderRadius: '8px', padding: '24px', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '20px' }}>
            {editingBadge ? 'Edit Badge' : 'Create New Badge'}
          </h2>
          
          {/* Badge Visual Preview */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginBottom: '24px',
            padding: '24px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '12px',
              border: '2px solid rgba(67,121,255,0.3)',
              background: 'rgba(67,121,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {imagePreview ? (
                <img src={imagePreview} alt="Badge preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : form.icon ? (
                <div style={{ fontSize: '48px' }}>{form.icon}</div>
              ) : (
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
                  Preview
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            {!editingBadge && (
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                  Key (unique, lowercase) *
                </label>
                <input
                  type="text"
                  value={form.key}
                  onChange={e => setForm({ ...form, key: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                  placeholder="e.g., triple_crown"
                  disabled={editingBadge}
                  style={{ width: '100%', background: '#080818', border: '1px solid rgba(67,121,255,0.25)', color: '#ffffff', padding: '10px 14px', borderRadius: '4px', fontSize: '13px', opacity: editingBadge ? 0.5 : 1 }}
                />
              </div>
            )}

            <div style={{ gridColumn: editingBadge ? 'span 2' : 'auto' }}>
              <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Triple Crown"
                style={{ width: '100%', background: '#080818', border: '1px solid rgba(67,121,255,0.25)', color: '#ffffff', padding: '10px 14px', borderRadius: '4px', fontSize: '13px' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
              Description *
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="e.g., Win all three league championships in one season"
              rows={2}
              style={{ width: '100%', background: '#080818', border: '1px solid rgba(67,121,255,0.25)', color: '#ffffff', padding: '10px 14px', borderRadius: '4px', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>

          {/* Icon vs Image Upload */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '12px' }}>
              Badge Visual *
            </label>
            
            {/* Image Upload Section */}
            <div style={{ 
              background: 'rgba(67,121,255,0.05)', 
              border: '2px dashed rgba(67,121,255,0.3)', 
              borderRadius: '8px', 
              padding: '20px',
              marginBottom: '16px',
              position: 'relative'
            }}>
              {imagePreview ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '2px solid rgba(67,121,255,0.3)',
                    background: 'rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', color: '#4ade80', fontWeight: 700, marginBottom: '4px' }}>
                      ✓ Image uploaded
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
                      {uploadedFilename || 'External URL'}
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      style={{
                        background: 'rgba(200,50,50,0.2)',
                        border: '1px solid rgba(200,50,50,0.4)',
                        color: '#f87171',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}
                    >
                      Remove Image
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                      Upload a custom badge image
                    </div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                      PNG, JPG, WEBP, GIF, or SVG • Max 2MB • Recommended: 256x256px
                    </div>
                  </div>
                  
                  <label
                    htmlFor="badge-image-upload"
                    style={{
                      display: 'block',
                      background: uploading ? 'rgba(67,121,255,0.2)' : '#4379FF',
                      border: 'none',
                      color: '#ffffff',
                      padding: '12px 24px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      textAlign: 'center',
                      opacity: uploading ? 0.6 : 1
                    }}
                  >
                    {uploading ? 'Uploading...' : '📤 Upload Image'}
                  </label>
                  <input
                    id="badge-image-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                </div>
              )}
            </div>

            {/* OR Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase' }}>
                or use emoji
              </span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
            </div>

            {/* Emoji Input */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
              <div>
                <input
                  type="text"
                  value={form.icon}
                  onChange={e => {
                    setForm({ ...form, icon: e.target.value })
                    if (e.target.value && !imagePreview) {
                      // Clear image_url if using emoji
                      setForm({ ...form, icon: e.target.value, image_url: '' })
                    }
                  }}
                  placeholder="🏆"
                  disabled={!!imagePreview}
                  style={{ 
                    width: '100%', 
                    background: imagePreview ? 'rgba(255,255,255,0.05)' : '#080818', 
                    border: '1px solid rgba(67,121,255,0.25)', 
                    color: '#ffffff', 
                    padding: '10px 14px', 
                    borderRadius: '4px', 
                    fontSize: '20px', 
                    textAlign: 'center',
                    opacity: imagePreview ? 0.5 : 1,
                    cursor: imagePreview ? 'not-allowed' : 'text'
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                  {imagePreview ? 'Remove image to use emoji' : 'Use any emoji as badge icon'}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                Tier *
              </label>
              <select
                value={form.tier}
                onChange={e => setForm({ ...form, tier: e.target.value })}
                style={{ width: '100%', background: '#080818', border: '1px solid rgba(67,121,255,0.25)', color: '#ffffff', padding: '10px 14px', borderRadius: '4px', fontSize: '13px' }}
              >
                {TIERS.map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                Category *
              </label>
              <input
                type="text"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                placeholder="e.g., Championships"
                style={{ width: '100%', background: '#080818', border: '1px solid rgba(67,121,255,0.25)', color: '#ffffff', padding: '10px 14px', borderRadius: '4px', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                Display Order
              </label>
              <input
                type="number"
                value={form.display_order}
                onChange={e => setForm({ ...form, display_order: parseInt(e.target.value) || 999 })}
                style={{ width: '100%', background: '#080818', border: '1px solid rgba(67,121,255,0.25)', color: '#ffffff', padding: '10px 14px', borderRadius: '4px', fontSize: '13px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                Condition Type *
              </label>
              <select
                value={form.condition_type}
                onChange={e => setForm({ ...form, condition_type: e.target.value })}
                style={{ width: '100%', background: '#080818', border: '1px solid rgba(67,121,255,0.25)', color: '#ffffff', padding: '10px 14px', borderRadius: '4px', fontSize: '13px' }}
              >
                {CONDITION_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                Condition Value (JSON) *
              </label>
              <input
                type="text"
                value={form.condition_value}
                onChange={e => setForm({ ...form, condition_value: e.target.value })}
                placeholder='{"min": 10} or {"type": "final_table"}'
                style={{ width: '100%', background: '#080818', border: '1px solid rgba(67,121,255,0.25)', color: '#ffffff', padding: '10px 14px', borderRadius: '4px', fontSize: '13px', fontFamily: 'monospace' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: saving ? 'rgba(67,121,255,0.3)' : '#4379FF',
                border: 'none',
                color: '#ffffff',
                padding: '12px 32px',
                borderRadius: '4px',
                fontSize: '12px',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? (editingBadge ? 'Updating...' : 'Creating...') : (editingBadge ? 'Update Badge' : 'Create Badge')}
            </button>
            
            {editingBadge && (
              <button
                onClick={resetForm}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'rgba(255,255,255,0.6)',
                  padding: '12px 32px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>
      )}

      {/* Badge List */}
      <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>
        Badge Definitions ({badges.length})
      </div>

      {loading ? (
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)' }}>Loading...</div>
      ) : badges.length === 0 ? (
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>
          No badges defined yet. Click "New Badge" to create one.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '8px' }}>
          {badges.map(badge => (
            <div key={badge.id} style={{
              background: '#080818',
              border: `1px solid ${badge.is_active ? 'rgba(67,121,255,0.2)' : 'rgba(200,50,50,0.2)'}`,
              borderRadius: '6px',
              padding: '16px',
              display: 'grid',
              gridTemplateColumns: '80px 1fr 120px auto',
              gap: '16px',
              alignItems: 'center'
            }}>
              {/* Badge Visual */}
              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '8px',
                border: '2px solid rgba(67,121,255,0.2)',
                background: 'rgba(67,121,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {badge.image_url ? (
                  <img src={badge.image_url} alt={badge.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ fontSize: '32px' }}>{badge.icon}</div>
                )}
              </div>
              
              {/* Badge Info */}
              <div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{badge.name}</span>
                  <span style={{
                    fontSize: '9px',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    background: 'rgba(67,121,255,0.15)',
                    color: '#4379FF',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>
                    {badge.tier}
                  </span>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontWeight: 700 }}>
                    {badge.category}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>
                  {badge.description}
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>
                  {badge.condition_type}: {JSON.stringify(badge.condition_value)}
                </div>
              </div>

              {/* Status */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '10px',
                  color: badge.is_active ? '#4ade80' : '#f87171',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  {badge.is_active ? '✓ Active' : '✗ Inactive'}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleEdit(badge)}
                  style={{
                    background: 'rgba(67,121,255,0.15)',
                    border: '1px solid rgba(67,121,255,0.3)',
                    color: '#4379FF',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleActive(badge.id, badge.is_active)}
                  style={{
                    background: badge.is_active ? 'rgba(200,50,50,0.15)' : 'rgba(0,180,80,0.15)',
                    border: `1px solid ${badge.is_active ? 'rgba(200,50,50,0.3)' : 'rgba(0,180,80,0.3)'}`,
                    color: badge.is_active ? '#f87171' : '#4ade80',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}
                >
                  {badge.is_active ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => handleDelete(badge.id)}
                  style={{
                    background: 'rgba(200,50,50,0.1)',
                    border: '1px solid rgba(200,50,50,0.25)',
                    color: '#f87171',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// TAB 2: PLAYER AWARDS (existing functionality)
// ============================================

function PlayerAwardsTab() {
  const [seasons, setSeasons] = useState<any[]>([])
  const [badges, setBadges] = useState<any[]>([])
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [form, setForm] = useState({
    player_id: '',
    badge_key: '',
    season_year: new Date().getFullYear().toString(),
    awarded_by: '',
  })
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([fetchSeasons(), fetchBadges(), fetchPlayers()])
      .finally(() => setLoading(false))
  }, [])

  async function fetchSeasons() {
    const res = await fetch('/api/admin/seasons')
    const data = await res.json()
    setSeasons(data.seasons || [])
  }

  async function fetchBadges() {
    const res = await fetch('/api/admin/badges')
    const data = await res.json()
    setBadges(data.badges || [])
  }

  async function fetchPlayers() {
    const res = await fetch('/api/admin/players-list')
    const data = await res.json()
    setPlayers(data.players || [])
  }

  async function handleAward() {
    if (!form.player_id || !form.badge_key) return
    setSaving(true)
    setMessage(null)
    try {
      const player = players.find(p => p.id === parseInt(form.player_id))
      const badge_name = form.badge_key

      const res = await fetch('/api/admin/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: parseInt(form.player_id),
          badge_key: form.badge_key,
          badge_name,
          season_year: parseInt(form.season_year),
          awarded_by: form.awarded_by || 'Admin',
        }),
      })
      if (!res.ok) throw new Error('Failed to award badge')
      setMessage({ type: 'success', text: `Badge awarded to ${player?.full_name}!` })
      fetchBadges()
    } catch {
      setMessage({ type: 'error', text: 'Failed to award badge' })
    } finally {
      setSaving(false)
    }
  }

  async function handleRevoke(id: number) {
    await fetch(`/api/admin/badges?id=${id}`, { method: 'DELETE' })
    fetchBadges()
  }

  async function handleAutoDetect() {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/badges/auto-detect', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMessage({ type: 'success', text: `Auto-detected ${data.awarded} season winner badge(s)` })
      fetchBadges()
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message })
    } finally {
      setSaving(false)
    }
  }

  const filteredPlayers = players.filter(p =>
    p.full_name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 20)

  if (loading) return <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Loading...</div>

  return (
    <div>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '32px' }}>
        Manually award badges to players and auto-detect season winners
      </p>

      {/* Auto detect */}
      <div style={{ background: '#0d0d2a', border: '1px solid rgba(67,121,255,0.2)', borderRadius: '8px', padding: '20px', marginBottom: '32px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
          Auto-detect Season Winners
        </div>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '16px' }}>
          Automatically finds the #1 player on each league leaderboard for each uploaded season and awards them the correct winner badge.
        </p>
        <button
          onClick={handleAutoDetect}
          disabled={saving}
          style={{
            background: '#4379FF', border: 'none', color: '#ffffff',
            padding: '11px 24px', borderRadius: '4px', fontSize: '12px',
            letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Detecting...' : 'Auto-detect Winners'}
        </button>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px', borderRadius: '4px', marginBottom: '24px',
          background: message.type === 'success' ? 'rgba(0,180,80,0.1)' : 'rgba(200,50,50,0.1)',
          border: `1px solid ${message.type === 'success' ? 'rgba(0,180,80,0.25)' : 'rgba(200,50,50,0.25)'}`,
          fontSize: '13px',
          color: message.type === 'success' ? '#4ade80' : '#f87171',
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>

        {/* Award form */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>
            Manually Award Badge
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Player search */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                Player *
              </label>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search player name..."
                style={{ width: '100%', background: '#080818', border: '1px solid rgba(67,121,255,0.25)', color: '#ffffff', padding: '10px 14px', borderRadius: '4px', fontSize: '13px', marginBottom: '6px' }}
              />
              {search && (
                <div style={{ background: '#080818', border: '1px solid rgba(67,121,255,0.2)', borderRadius: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                  {filteredPlayers.map(p => (
                    <div
                      key={p.id}
                      onClick={() => { setForm({ ...form, player_id: p.id.toString() }); setSearch(p.full_name) }}
                      style={{
                        padding: '10px 14px', fontSize: '13px', cursor: 'pointer',
                        color: form.player_id === p.id.toString() ? '#4379FF' : '#ffffff',
                        background: form.player_id === p.id.toString() ? 'rgba(67,121,255,0.08)' : 'transparent',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      {p.full_name}
                    </div>
                  ))}
                  {filteredPlayers.length === 0 && (
                    <div style={{ padding: '12px 14px', fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>No players found</div>
                  )}
                </div>
              )}
            </div>

            {/* Badge key */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                Badge Key *
              </label>
              <input
                type="text"
                value={form.badge_key}
                onChange={e => setForm({ ...form, badge_key: e.target.value })}
                placeholder="e.g., npl_winner_2025"
                style={{ width: '100%', background: '#080818', border: '1px solid rgba(67,121,255,0.25)', color: '#ffffff', padding: '10px 14px', borderRadius: '4px', fontSize: '13px' }}
              />
            </div>

            {/* Season year */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                Season Year
              </label>
              <select
                value={form.season_year}
                onChange={e => setForm({ ...form, season_year: e.target.value })}
                style={{ width: '100%', background: '#080818', border: '1px solid rgba(67,121,255,0.25)', color: '#ffffff', padding: '10px 14px', borderRadius: '4px', fontSize: '13px' }}
              >
                {[2026, 2025, 2024, 2023, 2022].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Awarded by */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                Awarded By
              </label>
              <input
                type="text"
                value={form.awarded_by}
                onChange={e => setForm({ ...form, awarded_by: e.target.value })}
                placeholder="Your name..."
                style={{ width: '100%', background: '#080818', border: '1px solid rgba(67,121,255,0.25)', color: '#ffffff', padding: '10px 14px', borderRadius: '4px', fontSize: '13px' }}
              />
            </div>

            <button
              onClick={handleAward}
              disabled={saving || !form.player_id || !form.badge_key}
              style={{
                background: form.player_id && form.badge_key && !saving ? '#1F1A5A' : 'rgba(67,121,255,0.1)',
                border: '1px solid rgba(67,121,255,0.4)', color: '#ffffff',
                padding: '12px 24px', borderRadius: '4px', fontSize: '12px',
                letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700,
                cursor: form.player_id && form.badge_key && !saving ? 'pointer' : 'not-allowed',
              }}
            >
              {saving ? 'Awarding...' : 'Award Badge'}
            </button>
          </div>
        </div>

        {/* Awarded badges list */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>
            Awarded Badges ({badges.length})
          </div>
          {badges.length === 0 ? (
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>
              No badges awarded yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '500px', overflowY: 'auto' }}>
              {badges.map(badge => (
                <div key={badge.id} style={{
                  background: '#080818', border: '1px solid rgba(67,121,255,0.12)',
                  borderRadius: '6px', padding: '12px 16px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', marginBottom: '3px' }}>
                      {badge.badge_name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                      {badge.players?.full_name} · Awarded by {badge.awarded_by || 'Admin'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevoke(badge.id)}
                    style={{
                      background: 'rgba(200,50,50,0.1)', border: '1px solid rgba(200,50,50,0.25)',
                      color: '#f87171', padding: '5px 12px', borderRadius: '4px',
                      fontSize: '11px', cursor: 'pointer', flexShrink: 0,
                    }}
                  >
                    Revoke
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