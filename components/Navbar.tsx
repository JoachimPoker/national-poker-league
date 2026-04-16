'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Home' },
  { href: '/leaderboard', label: 'Leaderboards' },
  { href: '/events', label: 'Events' },
  { href: '/players', label: 'Players' },
  { href: '/history', label: 'History' },
  { href: '/news', label: 'News' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav style={{
      background: '#0a0820',
      borderBottom: '1px solid rgba(67,121,255,0.2)',
      padding: '0 48px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '6px',
            background: 'linear-gradient(135deg, #1F1A5A, #4379FF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', color: '#ffffff', fontWeight: 900,
            border: '1px solid rgba(67,121,255,0.4)',
          }}>
            ♠
          </div>
          <div>
            <div style={{
              fontSize: '14px', fontWeight: 800, color: '#ffffff',
              letterSpacing: '1px', textTransform: 'uppercase', lineHeight: 1.2,
            }}>
              National Poker League
            </div>
            <div style={{
              fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase',
              background: 'linear-gradient(90deg, #C5A052, #FBF091)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1.4,
            }}>
              2026 Season
            </div>
          </div>
        </div>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {links.map(link => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase',
                textDecoration: 'none', padding: '8px 14px', borderRadius: '4px',
                color: active ? '#ffffff' : 'rgba(255,255,255,0.45)',
                background: active ? 'rgba(67,121,255,0.15)' : 'transparent',
                border: active ? '1px solid rgba(67,121,255,0.3)' : '1px solid transparent',
                fontWeight: active ? 700 : 500,
              }}
            >
              {link.label}
            </Link>
          )
        })}
      </div>

      {/* Admin */}
      <Link
        href="/admin"
        style={{
          fontSize: '11px',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          textDecoration: 'none',
          background: 'transparent',
          color: '#4379FF',
          border: '1px solid rgba(67,121,255,0.4)',
          padding: '9px 20px',
          borderRadius: '4px',
          fontWeight: 700,
        }}
      >
        Admin
      </Link>
    </nav>
  )
}