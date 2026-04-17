'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null)
  const [seasons, setSeasons] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingSeasons, setLoadingSeasons] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [uploadProgress, setUploadProgress] = useState<string>('')

  // Fetch seasons
  async function fetchSeasons() {
    setLoadingSeasons(true)
    try {
      const res = await fetch('/api/admin/seasons')
      
      // Check if response is OK
      if (!res.ok) {
        throw new Error(`Failed to fetch seasons: ${res.status} ${res.statusText}`)
      }
      
      // Check if response is JSON
      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text()
        console.error('Non-JSON response:', text)
        throw new Error('Server returned non-JSON response. Check console for details.')
      }
      
      const data = await res.json()
      setSeasons(data.seasons || [])
      
      // Auto-select active season if exists
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

  // Manual refresh button
  const handleRefreshSeasons = () => {
    setMessage({ type: 'success', text: 'Refreshing seasons...' })
    fetchSeasons()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setMessage(null)
    }
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
    setUploadProgress('Uploading file...')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('seasonId', selectedSeason.toString()) // Changed from season_id to seasonId

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      const summary = data.summary || {}
      setMessage({ 
        type: 'success', 
        text: `Upload successful! Players: ${summary.players || 0}, Events: ${summary.events || 0}, Results: ${summary.results || 0}${summary.skipped ? `, Skipped: ${summary.skipped}` : ''}` 
      })
      setFile(null)
      setUploadProgress('')
      
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Upload failed' })
      setUploadProgress('')
    } finally {
      setLoading(false)
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
          />
          <label
            htmlFor="file-input"
            className="cursor-pointer block"
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

      {/* Upload Progress */}
      {uploadProgress && (
        <div className="bg-[#0a0a1f] border border-[#1a1a3f] rounded-lg p-4 mb-6">
          <div className="text-white/60 text-sm">{uploadProgress}</div>
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
          <p>2. Click the refresh button (🔄) if you don't see your new season</p>
          <p>3. Select the season from the dropdown above</p>
          <p>4. Upload your Excel file with tournament results</p>
          <p>5. The file should have a "TotalPoints" sheet with player data</p>
          <p>6. Expected columns: Player Id, Forename, Surname, Date Of Birth, Tournament Name, etc.</p>
        </div>
      </div>

      {/* Debugging Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-4 bg-black/50 rounded text-xs text-white/40 font-mono">
          <div>Seasons loaded: {seasons.length}</div>
          <div>Selected season ID: {selectedSeason || 'None'}</div>
          <div>File selected: {file ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  )
}