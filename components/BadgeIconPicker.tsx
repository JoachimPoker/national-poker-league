'use client'
import { useState } from 'react'

const COMMON_EMOJIS = [
  '🏆', '🥇', '🥈', '🥉', '🎖️', '🏅', '⭐', '✨', '💎', '👑',
  '💰', '💵', '💸', '🎯', '🎲', '🃏', '♠️', '♥️', '♦️', '♣️',
  '🔥', '⚡', '💪', '🚀', '🎪', '🎭', '🎨', '🎬', '🎤', '🎧'
]

export default function BadgeIconPicker({
  value,
  onChange,
  useCustomImage,
  onImageUpload
}: {
  value: string
  onChange: (icon: string) => void
  useCustomImage: boolean
  onImageUpload: (file: File) => Promise<void>
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadMode, setUploadMode] = useState<'emoji' | 'image'>('emoji')

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      await onImageUpload(file)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="block text-sm font-bold text-white/80 mb-2">
        Badge Icon *
      </label>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setUploadMode('emoji')}
          className={`flex-1 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all ${
            uploadMode === 'emoji'
              ? 'bg-cyan-500/20 border border-cyan-400/30 text-cyan-400'
              : 'bg-white/5 border border-white/10 text-white/40 hover:text-white/60'
          }`}
        >
          Emoji
        </button>
        <button
          type="button"
          onClick={() => setUploadMode('image')}
          className={`flex-1 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all ${
            uploadMode === 'image'
              ? 'bg-cyan-500/20 border border-cyan-400/30 text-cyan-400'
              : 'bg-white/5 border border-white/10 text-white/40 hover:text-white/60'
          }`}
        >
          Upload Image
        </button>
      </div>

      {/* Emoji Mode */}
      {uploadMode === 'emoji' && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="w-full h-24 bg-black/40 border border-white/10 rounded-lg text-5xl hover:border-cyan-400/50 transition-all flex items-center justify-center overflow-hidden"
          >
            {useCustomImage ? (
              <img src={value} alt="Badge icon" className="w-full h-full object-cover" />
            ) : (
              value
            )}
          </button>

          {showEmojiPicker && (
            <div className="absolute z-10 mt-2 p-4 bg-[#0a0a0f] border border-white/20 rounded-lg shadow-2xl w-full">
              <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto">
                {COMMON_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      onChange(emoji)
                      setShowEmojiPicker(false)
                    }}
                    className="w-10 h-10 text-2xl hover:bg-white/10 rounded transition-all"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-white/10">
                <input
                  type="text"
                  value={useCustomImage ? '' : value}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded text-white text-sm"
                  placeholder="Or paste any emoji"
                  disabled={useCustomImage}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image Upload Mode */}
      {uploadMode === 'image' && (
        <div>
          <div className="w-full h-24 bg-black/40 border-2 border-dashed border-white/10 rounded-lg hover:border-cyan-400/50 transition-all flex flex-col items-center justify-center overflow-hidden relative">
            {useCustomImage && value ? (
              <>
                <img src={value} alt="Badge icon" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    onChange('🏆')
                    setUploadMode('emoji')
                  }}
                  className="absolute top-2 right-2 px-2 py-1 bg-red-500/80 hover:bg-red-500 text-white text-xs font-bold rounded transition-all"
                >
                  Remove
                </button>
              </>
            ) : (
              <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mb-2"></div>
                    <span className="text-xs text-white/60">Uploading...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-8 h-8 text-white/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-xs text-white/60 font-bold">Click to upload</span>
                    <span className="text-[10px] text-white/40 mt-1">PNG, JPG, WEBP, GIF, SVG (max 2MB)</span>
                  </>
                )}
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  )
}