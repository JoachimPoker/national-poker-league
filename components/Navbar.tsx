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
    <nav className="sticky top-0 z-50 bg-black/30 backdrop-blur-2xl border-b border-white/5 px-8 md:px-12 py-4 flex justify-between items-center transition-all">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-4 group">
        <div className="h-10 w-10 bg-gradient-to-br from-blue-600 via-cyan-500 to-indigo-900 rounded-xl flex items-center justify-center border border-cyan-400/30 shadow-[0_0_20px_rgba(0,243,255,0.3)] group-hover:shadow-[0_0_30px_rgba(0,243,255,0.5)] group-hover:scale-105 transition-all duration-300">
          <span className="text-xl text-white drop-shadow-md">♠</span>
        </div>
        <div className="flex flex-col">
          <span className="font-black text-lg tracking-[0.2em] uppercase italic leading-tight text-white group-hover:text-cyan-50 transition-colors drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            NPL
          </span>
          <span className="text-[9px] tracking-[3px] text-gold-gradient uppercase font-black">
            2026 Season
          </span>
        </div>
      </Link>

      {/* Nav links */}
      <div className="hidden lg:flex gap-8">
        {links.map(link => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative text-[10px] tracking-[4px] uppercase py-2 font-black transition-all duration-300 group ${
                active ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-white/40 hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(0,243,255,0.6)]'
              }`}
            >
              {link.label}
              {/* Neon Hover Underline */}
              <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 ${
                active ? 'w-full shadow-[0_0_10px_rgba(0,243,255,0.8)]' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>
          )
        })}
      </div>

      {/* Premium Admin CTA */}
      <Link
        href="/admin"
        className="flex items-center gap-2 text-[10px] font-black tracking-widest text-black bg-gradient-to-r from-[#D4AF37] via-[#FBF091] to-[#D4AF37] bg-[length:200%_auto] hover:bg-right px-6 py-2.5 rounded-xl hover:scale-105 transition-all duration-500 shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] uppercase"
      >
        <span className="text-[12px] leading-none text-black/80">🔒</span> Vault
      </Link>
    </nav>
  )
}