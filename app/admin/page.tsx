import { supabase } from '@/lib/supabase'
import Link from 'next/link'

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
    { label: 'Total Players', value: players || 0, href: '/players' },
    { label: 'Total Events', value: events || 0, href: '/events' },
    { label: 'Total Results', value: results || 0, href: '/leaderboard' },
    { label: 'Active Season', value: season?.name || 'None', href: '/admin' },
  ]

  const quickLinks = [
    { href: '/admin/upload', label: 'Upload Weekly Excel', desc: 'Add or update player results', color: 'var(--gold)' },
    { href: '/admin/news', label: 'Manage News', desc: 'Write posts or share social links', color: 'var(--plum-light)' },
    { href: '/admin/prizes', label: 'Manage Prizes', desc: 'Set season leaderboard prizes', color: '#f49080' },
    { href: '/admin/users', label: 'Manage Admin Users', desc: 'Add or remove admin accounts', color: 'var(--cream-muted)' },
  ]

  return (
    <div>
      <h1 style={{
        fontSize: '28px', fontWeight: 500, color: 'var(--cream)',
        marginBottom: '8px', letterSpacing: '-0.5px',
      }}>
        Admin Dashboard
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '40px' }}>
        Manage your National Poker League season data
      </p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' }}>
        {cards.map(card => (
          <div key={card.label} style={{
            background: '#0a0814', border: '1px solid rgba(122,33,100,0.25)',
            borderRadius: '4px', padding: '20px',
          }}>
            <div style={{ fontSize: '10px', color: 'var(--text-dimmest)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>
              {card.label}
            </div>
            <div style={{ fontSize: '28px', fontWeight: 500, color: 'var(--gold)' }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <h2 style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-dimmest)', marginBottom: '16px' }}>
        Quick Actions
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {quickLinks.map(link => (
          <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#0a0814', border: '1px solid rgba(122,33,100,0.25)',
              borderRadius: '4px', padding: '24px',
              borderLeft: `3px solid ${link.color}`,
            }}>
              <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--cream)', marginBottom: '6px' }}>
                {link.label}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-dimmer)' }}>
                {link.desc}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}