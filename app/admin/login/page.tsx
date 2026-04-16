'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

async function handleLogin() {
    if (!email || !password) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Invalid email or password')
        return
      }

      // Use window.location for a hard redirect so the cookie is picked up
      window.location.href = '/admin'
    } catch {
      setError('Something went wrong — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0814',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        width: '100%', maxWidth: '400px', padding: '0 24px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            display: 'inline-block',
            borderLeft: '3px solid var(--gold)', paddingLeft: '16px',
            textAlign: 'left',
          }}>
            <div style={{
              fontSize: '18px', fontWeight: 500, color: '#fcf6ee',
              letterSpacing: '2px', textTransform: 'uppercase',
            }}>
              National Poker League
            </div>
            <div style={{
              fontSize: '10px', color: '#D59516',
              letterSpacing: '3px', textTransform: 'uppercase', marginTop: '3px',
            }}>
              Admin Panel
            </div>
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: '#080612',
          border: '1px solid rgba(122,33,100,0.35)',
          borderRadius: '4px',
          padding: '36px',
        }}>
          <h1 style={{
            fontSize: '20px', fontWeight: 500, color: '#fcf6ee',
            marginBottom: '6px', letterSpacing: '-0.3px',
          }}>
            Sign in
          </h1>
          <p style={{ fontSize: '13px', color: '#7a7090', marginBottom: '28px' }}>
            Enter your admin credentials to continue
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block', fontSize: '11px', letterSpacing: '1px',
                textTransform: 'uppercase', color: '#4a4060', marginBottom: '8px',
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="your@email.com"
                style={{
                  width: '100%', background: '#0a0814',
                  border: '1px solid rgba(122,33,100,0.4)',
                  color: '#fcf6ee', padding: '11px 14px',
                  borderRadius: '4px', fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block', fontSize: '11px', letterSpacing: '1px',
                textTransform: 'uppercase', color: '#4a4060', marginBottom: '8px',
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                style={{
                  width: '100%', background: '#0a0814',
                  border: '1px solid rgba(122,33,100,0.4)',
                  color: '#fcf6ee', padding: '11px 14px',
                  borderRadius: '4px', fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: '4px',
                background: 'rgba(100,0,0,0.15)',
                border: '1px solid rgba(200,0,0,0.2)',
                fontSize: '12px', color: '#f87171',
              }}>
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading || !email || !password}
              style={{
                background: email && password && !loading ? '#7a2164' : 'rgba(122,33,100,0.2)',
                border: 'none', color: '#fcf6ee',
                padding: '13px 24px', borderRadius: '4px',
                fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase',
                cursor: email && password && !loading ? 'pointer' : 'not-allowed',
                fontWeight: 500, width: '100%', marginTop: '4px',
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <a href="/" style={{
            fontSize: '12px', color: '#3a3050', textDecoration: 'none',
          }}>
            Back to website
          </a>
        </div>
      </div>
    </div>
  )
}