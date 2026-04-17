import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import BadgeInitSection from './BadgeInitSection'

export default async function AdminDashboard() {
  const { data: season } = await supabase
    .from('seasons')
    .select('*')
    .eq('is_active', true)
    .single()

  const [{ count: players }, { count: events }, { count: results }] = await Promise.all([
    supabase.from('players').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('results').select('*', { count: 'exact', head: true }),
  ])

  const cards = [
    { label: 'Total Players', value: players || 0 },
    { label: 'Total Events', value: events || 0 },
    { label: 'Total Results', value: results || 0 },
    { label: 'Active Season', value: season?.name || 'None' },
  ]

  const quickLinks = [
    { href: '/admin/upload', label: 'Upload Weekly Excel', desc: 'Add or update player results', border: 'border-cyan-400', glow: 'hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]' },
    { href: '/admin/news', label: 'Manage News', desc: 'Write posts or share social links', border: 'border-purple-500', glow: 'hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]' },
    { href: '/admin/prizes', label: 'Manage Prizes', desc: 'Set season leaderboard prizes', border: 'border-[#D4AF37]', glow: 'hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]' },
    { href: '/admin/users', label: 'Manage Admin Users', desc: 'Add or remove admin accounts', border: 'border-emerald-400', glow: 'hover:shadow-[0_0_20px_rgba(52,211,153,0.15)]' },
  ]

  return (
    <div className="animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-wider mb-2">
          System <span className="text-[#D4AF37]">Overview</span>
        </h1>
        <p className="text-xs text-white/50 font-mono tracking-widest uppercase">
          Secure Vault Access · Manage Season Data
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {cards.map(card => (
          <div key={card.label} className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group hover:border-white/20 hover:bg-white/5 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-[20px] pointer-events-none group-hover:bg-white/10 transition-colors"></div>
            <div className="text-[10px] text-white/40 uppercase tracking-[3px] font-black mb-3 relative z-10">
              {card.label}
            </div>
            <div className="text-3xl font-black text-white relative z-10 font-mono drop-shadow-sm">
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <h2 className="text-[11px] font-black text-white/60 tracking-[4px] uppercase mb-6 border-b border-white/10 pb-4">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quickLinks.map(link => (
          <Link 
            key={link.href} 
            href={link.href} 
            className={`group bg-black/40 border border-white/10 rounded-2xl p-8 border-l-4 ${link.border} ${link.glow} transition-all duration-300 hover:bg-white/5 hover:-translate-y-1 relative overflow-hidden`}
          >
            <div className="relative z-10">
              <div className="text-sm font-black text-white uppercase tracking-widest mb-2 group-hover:text-white transition-colors flex justify-between items-center">
                {link.label}
                <span className="text-white/20 group-hover:text-white/50 transition-colors">→</span>
              </div>
              <div className="text-[10px] text-white/40 font-bold tracking-widest uppercase">
                {link.desc}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Badge Initialization Section */}
      <BadgeInitSection />

    </div>
  )
}