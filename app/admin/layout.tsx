import { getAdminSession } from '@/lib/auth'
import LogoutButton from './LogoutButton'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAdminSession()

  return (
    <div className="relative min-h-screen bg-[#040408] text-white font-sans selection:bg-cyan-500/30 overflow-hidden">

      {/* Global ambient background for entire admin area */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 casino-grid opacity-30"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[150px] animate-float mix-blend-screen"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-600/10 rounded-full blur-[150px] animate-float-delayed mix-blend-screen"></div>
      </div>

      {/* Admin Navbar */}
      <nav className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/10 px-6 md:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">

          <div className="border-l-2 border-[#D4AF37] pl-3">
            <div className="text-[12px] font-black text-white tracking-[3px] uppercase leading-tight drop-shadow-md">
              NPL Vault
            </div>
            <div className="text-[8px] text-[#D4AF37] tracking-[2px] uppercase font-black">
              Management Panel
            </div>
          </div>

          <div className="hidden lg:flex gap-6">
            {[
              { href: '/admin', label: 'Dashboard' },
              { href: '/admin/upload', label: 'Upload Data' },
              { href: '/admin/news', label: 'News' },
              { href: '/admin/prizes', label: 'Prizes' },
              { href: '/admin/seasons', label: 'Seasons' },
              { href: '/admin/users', label: 'Users' },
              { href: '/admin/badges', label: 'Badges' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[10px] tracking-[2px] text-white/40 hover:text-white uppercase font-bold transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          {user && (
            <span className="hidden md:inline-block text-[10px] text-white/30 uppercase tracking-[2px] font-black">
              {user.name}
            </span>
          )}
          
            <a href="/"
            className="text-[10px] text-cyan-400 hover:text-cyan-300 uppercase tracking-[2px] font-black transition-colors flex items-center gap-1"
          >
            View Site <span className="text-lg leading-none mt-[-2px]">↗</span>
          </a>
          <LogoutButton />
        </div>
      </nav>

      {/* Main Admin Content Wrapper */}
      <div className="p-6 md:p-12 max-w-[1400px] mx-auto relative z-10">
        {children}
      </div>

    </div>
  )
}