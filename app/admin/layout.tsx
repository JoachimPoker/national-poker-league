import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const session = cookieStore.get('npl_admin_session')
  const user = session ? JSON.parse(session.value) : null

  return (
    <div style={{ minHeight: '100vh', background: '#080612' }}>
      <nav style={{
        background: '#0a0814',
        borderBottom: '1px solid rgba(122,33,100,0.4)',
        padding: '0 40px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ borderLeft: '3px solid var(--plum)', paddingLeft: '14px' }}>
          <div style={{
            fontSize: '14px', fontWeight: 500,
            color: 'var(--cream)', letterSpacing: '2px', textTransform: 'uppercase',
          }}>
            NPL Admin
          </div>
          <div style={{
            fontSize: '9px', color: 'var(--plum-light)',
            letterSpacing: '2px', textTransform: 'uppercase',
          }}>
            Management Panel
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px' }}>
          {[
            { href: '/admin', label: 'Dashboard' },
            { href: '/admin/upload', label: 'Upload Data' },
            { href: '/admin/news', label: 'News' },
            { href: '/admin/prizes', label: 'Prizes' },
            { href: '/admin/seasons', label: 'Seasons' },
            { href: '/admin/users', label: 'Users' },
            { href: '/admin/badges', label: 'Badges' },
          ].map(link => (
            <a key={link.href} href={link.href} style={{
              fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase',
              color: 'var(--text-dim)', textDecoration: 'none',
            }}>
              {link.label}
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user && (
            <span style={{ fontSize: '12px', color: 'var(--text-dimmest)' }}>
              {user.name}
            </span>
          )}
          <a href="/" style={{
            fontSize: '11px', color: 'var(--text-dimmer)',
            textDecoration: 'none', letterSpacing: '1px',
          }}>
            View site
          </a>
          <LogoutButton />
        </div>
      </nav>

      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        {children}
      </div>
    </div>
  )
}