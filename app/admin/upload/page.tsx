'use client'

import { useState, useEffect, useRef } from 'react'

interface UploadProgress {
  stage: string
  percent: number
  message: string
  completed: boolean
  error?: string
  result?: {
    success: boolean
    summary?: { players: number; events: number; results: number; skipped: number }
    badges?: { statsUpdated: number; badgesAwarded: number }
  }
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null)
  const [seasons, setSeasons] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingSeasons, setLoadingSeasons] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  async function fetchSeasons() {
    setLoadingSeasons(true)
    try {
      const res = await fetch('/api/admin/seasons')

      if (!res.ok) {
        throw new Error(`Failed to fetch seasons: ${res.status} ${res.statusText}`)
      }

      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text()
        console.error('Non-JSON response:', text)
        throw new Error('Server returned non-JSON response. Check console for details.')
      }

      const data = await res.json()
      setSeasons(data.seasons || [])

      const activeSeason = data.seasons?.find((s: any) => s.is_active)
      if (activeSeason && !selectedSeason) {
        setSelectedSeason(activeSeason.id)
      }
    } catch (error: any) {
      console.error('Error fetching seasons:', error)
      setMessage({
        type: 'error',
        text: `Failed to load seasons: ${error.message}`
      })
    } finally {
      setLoadingSeasons(false)
    }
  }

  useEffect(() => {
    fetchSeasons()
  }, [])

  const handleRefreshSeasons = () => {
    setMessage({ type: 'success', text: 'Refreshing seasons...' })
    fetchSeasons()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setMessage(null)
      setProgress(null)
    }
  }

  const startPolling = (jobId: string) => {
    // Clear any existing poll
    if (pollRef.current) clearInterval(pollRef.current)

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/upload?jobId=${jobId}`)
        if (!res.ok) {
          // Job not found or auth expired — stop polling
          if (pollRef.current) clearInterval(pollRef.current)
          setLoading(false)
          setMessage({ type: 'error', text: 'Lost connection to upload job' })
          return
        }

        const data: UploadProgress = await res.json()
        setProgress(data)

        if (data.completed) {
          if (pollRef.current) clearInterval(pollRef.current)
          setLoading(false)

          if (data.error) {
            setMessage({ type: 'error', text: data.error })
          } else if (data.result?.summary) {
            const { players, events, results, skipped } = data.result.summary
            const badgesAwarded = data.result.badges?.badgesAwarded || 0
            setMessage({
              type: 'success',
              text: `Upload complete! Players: ${players}, Events: ${events}, Results: ${results}${skipped ? `, Skipped: ${skipped}` : ''}, Badges awarded: ${badgesAwarded}`
            })
            setFile(null)
            const fileInput = document.getElementById('file-input') as HTMLInputElement
            if (fileInput) fileInput.value = ''
          }
        }
      } catch (err) {
        console.error('Progress poll error:', err)
      }
    }, 500)
  }

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file' })
      return
    }

    if (!selectedSeason) {
      setMessage({ type: 'error', text: 'Please select a season' })
      return
    }

    setLoading(true)
    setMessage(null)
    setProgress({
      stage: 'uploading',
      percent: 0,
      message: 'Uploading file to server...',
      completed: false,
    })

    const formData = new FormData()
    formData.append('file', file)
    formData.append('seasonId', selectedSeason.toString())

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      if (data.jobId) {
        startPolling(data.jobId)
      } else {
        // Shouldn't happen with the new backend, but handle gracefully
        setMessage({ type: 'success', text: 'Upload complete!' })
        setLoading(false)
        setProgress(null)
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Upload failed' })
      setLoading(false)
      setProgress(null)
    }
  }

  // Map stages to friendly labels
  const stageLabel = (stage: string) => {
    switch (stage) {
      case 'uploading': return 'Uploading file'
      case 'reading': return 'Reading Excel file'
      case 'parsing': return 'Parsing data'
      case 'players': return 'Saving players'
      case 'events': return 'Saving events'
      case 'results': return 'Saving results'
      case 'badges': return 'Updating badges'
      case 'complete': return 'Complete'
      case 'error': return 'Error'
      default: return stage
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Upload Tournament Data</h1>
          <p className="text-sm text-white/50">Upload Excel files with tournament results</p>
        </div>
      </div>

      {/* Season Selector */}
      <div className="bg-[#0a0a1f] border border-[#1a1a3f] rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-xs font-bold text-white/40 uppercase tracking-wider">
            Select Season *
          </label>
          <button
            onClick={handleRefreshSeasons}
            disabled={loadingSeasons}
            className="text-xs text-[#4379FF] hover:text-[#5a8aff] font-bold uppercase tracking-wider"
          >
            {loadingSeasons ? 'Refreshing...' : '🔄 Refresh Seasons'}
          </button>
        </div>

        {loadingSeasons ? (
          <div className="text-white/50 text-sm">Loading seasons...</div>
        ) : seasons.length === 0 ? (
          <div className="text-white/50 text-sm">
            No seasons found. Please create a season first in the Seasons page.
          </div>
        ) : (
          <select
            value={selectedSeason || ''}
            onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
            className="w-full bg-[#080818] border border-[#1a1a3f] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#4379FF] text-sm"
          >
            <option value="">-- Select a Season --</option>
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.year} {season.league} {season.is_active ? '(Active)' : ''}
              </option>
            ))}
          </select>
        )}

        {selectedSeason && (
          <div className="mt-2 text-xs text-white/40">
            Selected: {seasons.find(s => s.id === selectedSeason)?.year} {seasons.find(s => s.id === selectedSeason)?.league}
          </div>
        )}
      </div>

      {/* File Upload */}
      <div className="bg-[#0a0a1f] border border-[#1a1a3f] rounded-lg p-6 mb-6">
        <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-4">
          Upload Excel File *
        </label>

        <div className="border-2 border-dashed border-[#1a1a3f] rounded-lg p-8 text-center hover:border-[#4379FF] transition-colors">
          <input
            id="file-input"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
            disabled={loading}
          />
          <label
            htmlFor="file-input"
            className={`block ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            <div className="text-4xl mb-4">📁</div>
            {file ? (
              <div>
                <div className="text-white font-bold mb-1">{file.name}</div>
                <div className="text-white/40 text-sm">{(file.size / 1024).toFixed(2)} KB</div>
              </div>
            ) : (
              <div>
                <div className="text-white mb-2">Click to select Excel file</div>
                <div className="text-white/40 text-sm">.xlsx or .xls format</div>
              </div>
            )}
          </label>
        </div>
      </div>

      {/* Progress Bar */}
      {progress && !progress.completed && (
        <div className="bg-[#0a0a1f] border border-cyan-400/30 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black text-cyan-400 uppercase tracking-wider">
              {stageLabel(progress.stage)}
            </span>
            <span className="text-lg font-black text-white font-mono">
              {progress.percent}%
            </span>
          </div>

          <div className="w-full bg-black/60 rounded-full h-4 overflow-hidden relative border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 ease-out relative"
              style={{ width: `${progress.percent}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>

          <div className="mt-3 text-xs text-white/60 font-mono text-center">
            {progress.message}
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div
          className={`rounded-lg p-4 mb-6 ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/30 text-green-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={loading || !file || !selectedSeason || loadingSeasons}
        className={`w-full py-4 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${
          loading || !file || !selectedSeason || loadingSeasons
            ? 'bg-white/5 text-white/30 cursor-not-allowed'
            : 'bg-[#4379FF] text-white hover:bg-[#5a8aff] shadow-lg shadow-[#4379FF]/20'
        }`}
      >
        {loading ? 'Uploading...' : 'Upload Data'}
      </button>

      {/* Instructions */}
      <div className="mt-8 bg-[#0a0a1f] border border-[#1a1a3f] rounded-lg p-6">
        <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Upload Instructions</h3>
        <div className="space-y-2 text-sm text-white/60">
          <p>1. Create or select a season in the Seasons page first</p>
          <p>2. Click the refresh button (🔄) if you don&apos;t see your new season</p>
          <p>3. Select the season from the dropdown above</p>
          <p>4. Upload your Excel file with tournament results</p>
          <p>5. The file should have a &quot;TotalPoints&quot; sheet with player data</p>
          <p>6. Expected columns: Player Id, Forename, Surname, Date Of Birth, Tournament Name, etc.</p>
        </div>
      </div>

      {/* Debugging Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-4 bg-black/50 rounded text-xs text-white/40 font-mono">
          <div>Seasons loaded: {seasons.length}</div>
          <div>Selected season ID: {selectedSeason || 'None'}</div>
          <div>File selected: {file ? 'Yes' : 'No'}</div>
          {progress && <div>Current stage: {progress.stage} ({progress.percent}%)</div>}
        </div>
      )}
    </div>
  )
}