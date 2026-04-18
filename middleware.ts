import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    const session = await verifySessionToken(token)
    if (!session) {
      // Cookie is tampered, expired, or invalid — clear it and redirect
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete(SESSION_COOKIE_NAME)
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}