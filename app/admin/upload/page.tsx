'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [seasonId, setSeasonId] = useState('1')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleUpload() {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('seasonId', seasonId)

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET || 'npl2026supersecretkey'}`,
        },
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setResult(data.summary)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 style={{
        fontSize: '28px', fontWeight: 500, color: 'var(--cream)',
        marginBottom: '8px', letterSpacing: '-0.5px',
      }}>
        Upload Weekly Data
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '40px' }}>
        Upload your weekly Excel file to update all player results, events and leaderboards.
        Existing data will be updated automatically — no duplicates will be created.
      </p>

      {/* Season selector */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block', fontSize: '11px', letterSpacing: '1.5px',
          textTransform: 'uppercase', color: 'var(--text-dimmer)', marginBottom: '8px',
        }}>
          Season
        </label>
        <select
          value={seasonId}
          onChange={e => setSeasonId(e.target.value)}
          style={{
            background: '#0a0814', border: '1px solid rgba(122,33,100,0.4)',
            color: 'var(--cream)', padding: '10px 14px', borderRadius: '4px',
            fontSize: '13px', width: '100%',
          }}
        >
          <option value="1">2026 Season</option>
        </select>
      </div>

      {/* File picker */}
      <div style={{ marginBottom: '32px' }}>
        <label style={{
          display: 'block', fontSize: '11px', letterSpacing: '1.5px',
          textTransform: 'uppercase', color: 'var(--text-dimmer)', marginBottom: '8px',
        }}>
          Excel File (.xlsx)
        </label>
        <div style={{
          border: '2px dashed rgba(122,33,100,0.4)', borderRadius: '4px',
          padding: '40px', textAlign: 'center',
          background: file ? 'rgba(122,33,100,0.05)' : 'transparent',
        }}>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={e => setFile(e.target.files?.[0] || null)}
            style={{ display: 'none' }}
            id="file-input"
          />
          <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
            {file ? (
              <div>
                <div style={{ fontSize: '16px', color: 'var(--gold)', marginBottom: '4px' }}>
                  ✓ {file.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-dimmer)' }}>
                  {(file.size / 1024).toFixed(0)} KB — click to change
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '14px', color: 'var(--text-dim)', marginBottom: '4px' }}>
                  Click to select your Excel file
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-dimmest)' }}>
                  Accepts .xlsx or .xls files
                </div>
              </div>
            )}
          </label>
        </div>
      </div>

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        style={{
          background: file && !loading ? 'var(--plum)' : 'rgba(122,33,100,0.2)',
          border: 'none', color: 'var(--cream)',
          padding: '14px 32px', borderRadius: '4px',
          fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase',
          cursor: file && !loading ? 'pointer' : 'not-allowed',
          width: '100%', fontWeight: 500,
        }}
      >
        {loading ? 'Uploading & Processing...' : 'Upload & Process File'}
      </button>

      {/* Result */}
      {result && (
        <div style={{
          marginTop: '24px', background: 'rgba(0,100,0,0.1)',
          border: '1px solid rgba(0,200,0,0.2)', borderRadius: '4px', padding: '20px',
        }}>
          <div style={{ fontSize: '13px', color: '#4ade80', marginBottom: '12px', fontWeight: 500 }}>
            ✓ Upload successful!
          </div>
          {[
            { label: 'Players updated', value: result.players },
            { label: 'Events updated', value: result.events },
            { label: 'Results updated', value: result.results },
            { label: 'Rows skipped', value: result.skipped },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: '12px', color: 'var(--text-dim)', marginBottom: '6px',
            }}>
              <span>{item.label}</span>
              <span style={{ color: 'var(--cream)' }}>{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          marginTop: '24px', background: 'rgba(100,0,0,0.15)',
          border: '1px solid rgba(200,0,0,0.2)', borderRadius: '4px', padding: '20px',
        }}>
          <div style={{ fontSize: '13px', color: '#f87171' }}>
            ✗ Error: {error}
          </div>
        </div>
      )}
    </div>
  )
}