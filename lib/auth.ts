import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const SESSION_COOKIE_NAME = 'npl_admin_session'
const SESSION_DURATION_SECONDS = 60 * 60 * 24 // 24 hours

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error(
      'ADMIN_SESSION_SECRET is missing or too short (must be at least 32 characters)'
    )
  }
  return new TextEncoder().encode(secret)
}

export interface AdminSessionPayload {
  id: number
  email: string
  name: string
}

/**
 * Sign a new session token for an admin user.
 * Called from the login route after password verification.
 */
export async function createSessionToken(user: AdminSessionPayload): Promise<string> {
  return await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .setIssuer('npl-admin')
    .sign(getSecret())
}

/**
 * Verify a session token. Returns the payload if valid, null otherwise.
 * Edge-runtime safe — used by middleware.
 */
export async function verifySessionToken(
  token: string
): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: 'npl-admin',
    })
    // Defensive: ensure the payload has the shape we expect
    if (
      typeof payload.id === 'number' &&
      typeof payload.email === 'string' &&
      typeof payload.name === 'string'
    ) {
      return {
        id: payload.id,
        email: payload.email,
        name: payload.name,
      }
    }
    return null
  } catch {
    // Expired, tampered, wrong signature, or malformed — all treated the same
    return null
  }
}

/**
 * Read and verify the admin session from cookies.
 * Returns the admin user or null. Use this in server components.
 */
export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!token) return null
  return await verifySessionToken(token)
}

/**
 * Guard for API routes. Call at the top of every admin handler.
 *
 * Usage:
 *   const authError = await requireAdmin()
 *   if (authError) return authError
 *   // ... rest of handler
 *
 * Returns null on success, or a 401 NextResponse on failure.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

/**
 * Set the session cookie. Called from the login route.
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_SECONDS,
    path: '/',
  })
}

/**
 * Clear the session cookie. Called from the logout route.
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export { SESSION_COOKIE_NAME }