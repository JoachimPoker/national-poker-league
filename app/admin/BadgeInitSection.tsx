'use client'
import { useState, useEffect } from 'react'

export default function BadgeInitSection() {
  const [loading, setLoading] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [progress, setProgress] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Poll for progress updates
  useEffect(() => {
    if (!jobId || !loading) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/admin/badge-operations?jobId=${jobId}`)
        const data = await res.json()
        
        setProgress(data)
        
        if (data.completed) {
          setLoading(false)
          clearInterval(interval)
          
          if (data.error) {
            setError(data.error)
          }
        }
      } catch (err: any) {
        console.error('Progress poll error:', err)
      }
    }, 500) // Poll every 500ms

    return () => clearInterval(interval)
  }, [jobId, loading])

  const handleUpdateStats = async () => {
    setLoading(true)
    setError(null)
    setProgress(null)
    setJobId(null)

    try {
      const res = await fetch('/api/admin/badge-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_stats_all' })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to update stats')
        setLoading(false)
      } else {
        setJobId(data.jobId)
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleAutoAwardBadges = async () => {
    setLoading(true)
    setError(null)
    setProgress(null)
    setJobId(null)

    try {
      const res = await fetch('/api/admin/badge-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'auto_award_all' })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to auto-award badges')
        setLoading(false)
      } else {
        setJobId(data.jobId)
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const progressPercent = progress ? Math.round((progress.current / progress.total) * 100) : 0

  return (
    <div className="mt-12">
      <h2 className="text-[11px] font-black text-white/60 tracking-[4px] uppercase mb-6 border-b border-white/10 pb-4">
        Badge System Initialization
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Step 1: Update Stats */}
        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group hover:border-blue-400/30 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-[20px] pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>
          
          <div className="relative z-10">
            <div className="text-[10px] text-white/40 uppercase tracking-[3px] font-black mb-2">
              Step 1
            </div>
            <h3 className="text-lg font-black text-white mb-3">Update Player Stats</h3>
            <p className="text-xs text-white/50 mb-4 leading-relaxed">
              Calculates lifetime totals for all players (wins, cashes, money, final tables, events).
            </p>
            <button
              onClick={handleUpdateStats}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors text-sm uppercase tracking-wider"
            >
              {loading ? '⏳ Processing...' : '🔄 Update Stats'}
            </button>
          </div>
        </div>

        {/* Step 2: Award Badges */}
        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group hover:border-green-400/30 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-[20px] pointer-events-none group-hover:bg-green-500/10 transition-colors"></div>
          
          <div className="relative z-10">
            <div className="text-[10px] text-white/40 uppercase tracking-[3px] font-black mb-2">
              Step 2
            </div>
            <h3 className="text-lg font-black text-white mb-3">Auto-Award Badges</h3>
            <p className="text-xs text-white/50 mb-4 leading-relaxed">
              Awards all eligible badges to players based on their lifetime stats. Run after updating stats.
            </p>
            <button
              onClick={handleAutoAwardBadges}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors text-sm uppercase tracking-wider"
            >
              {loading ? '⏳ Processing...' : '🎖️ Award Badges'}
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {loading && progress && (
        <div className="bg-black/40 border border-cyan-400/30 rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black text-cyan-400 uppercase tracking-wider">
              {progress.status}
            </span>
            <span className="text-lg font-black text-white font-mono">
              {progressPercent}%
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-black/60 rounded-full h-4 overflow-hidden relative border border-white/10">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 ease-out relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          
          <div className="mt-3 text-xs text-white/60 font-mono text-center">
            {progress.current} of {progress.total} players processed
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
          <div className="text-xs font-black text-red-400 uppercase tracking-wider mb-2">❌ Error</div>
          <p className="text-sm text-red-300 font-mono">{error}</p>
        </div>
      )}

      {/* Success Display */}
      {progress?.completed && !error && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <div className="text-xs font-black text-green-400 uppercase tracking-wider mb-2">✅ Success</div>
          <pre className="text-xs text-green-300 font-mono bg-black/30 p-3 rounded overflow-auto">
            {JSON.stringify(progress.result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}