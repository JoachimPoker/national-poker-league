'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()

  // Check if already logged in on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/admin/check-session', {
          method: 'GET',
          credentials: 'include'
        })
        if (res.ok) {
          // Already logged in, redirect to dashboard
          router.push('/admin')
        }
      } catch (err) {
        // Not logged in, proceed normally
      } finally {
        setIsChecking(false)
      }
    }
    
    checkSession()
  }, [router])

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

      window.location.href = '/admin'
    } catch {
      setError('Something went wrong — please try again')
    } finally {
      setLoading(false)
    }
  }

  // Don't render until we've checked the session
  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#040408] flex items-center justify-center">
        <div className="text-white/60 text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#040408] text-white flex flex-col items-center justify-center font-sans relative overflow-hidden">
      
      {/* GLOBAL AMBIENT LIGHTING */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 casino-grid opacity-40"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#D4AF37]/10 rounded-full blur-[150px] animate-float mix-blend-screen"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[40vw] h-[40vw] bg-purple-600/10 rounded-full blur-[150px] animate-float-delayed mix-blend-screen"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6 py-12">
        
        {/* LOGO */}
        <div className="text-center mb-12">
          <div className="inline-block border-l-4 border-[#D4AF37] pl-4">
            <div className="text-lg font-black text-white tracking-[2px] uppercase leading-tight">
              National Poker League
            </div>
            <div className="text-[10px] text-[#D4AF37] tracking-[3px] uppercase font-black mt-1">
              Admin Panel
            </div>
          </div>
        </div>

        {/* CARD */}
        <div className="glass-panel rounded-2xl p-8 border-t border-[#D4AF37]/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/10 blur-[60px] rounded-full pointer-events-none"></div>

          <div className="relative z-10">
            <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-wider">
              Sign In
            </h1>
            <p className="text-sm text-white/50 mb-8 font-medium">
              Enter your admin credentials to continue
            </p>

            <div className="space-y-5">
              
              {/* Email Field */}
              <div>
                <label className="block text-[10px] text-white/40 uppercase tracking-[2px] font-black mb-3">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="admin@example.com"
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-[#D4AF37]/50 focus:outline-none transition-all text-sm"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-[10px] text-white/40 uppercase tracking-[2px] font-black mb-3">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-[#D4AF37]/50 focus:outline-none transition-all text-sm"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-400/30 text-red-400 text-sm font-mono">
                  {error}
                </div>
              )}

              {/* Sign In Button */}
              <button
                onClick={handleLogin}
                disabled={loading || !email || !password}
                className={`w-full py-3 px-6 rounded-lg font-black text-sm uppercase tracking-wider transition-all ${
                  email && password && !loading
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#8B6914] text-black hover:scale-105 shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]'
                    : 'bg-white/5 text-white/30 cursor-not-allowed'
                }`}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>

              {/* Back to Website Link */}
              <div className="text-center pt-2">
                <Link
                  href="/"
                  className="text-xs text-white/30 hover:text-white/60 transition-colors uppercase tracking-wider font-bold"
                >
                  ← Back to Website
                </Link>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  )
}