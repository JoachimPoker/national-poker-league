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
      className="border border-purple-900/40 text-white/50 hover:text-white/80 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded transition-colors"
    >
      Sign out
    </button>
  )
}