'use client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        background: 'transparent',
        border: '1px solid rgba(122,33,100,0.4)',
        color: 'var(--text-dimmer)',
        fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase',
        padding: '6px 14px', borderRadius: '2px', cursor: 'pointer',
      }}
    >
      Sign out
    </button>
  )
}