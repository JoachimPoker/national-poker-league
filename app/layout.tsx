import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'National Poker League',
  description: 'Official home of the National Poker League — Season 2026',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}