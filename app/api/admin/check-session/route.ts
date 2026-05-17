import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    return NextResponse.json({ authenticated: true, user: session })
  } catch (error) {
    return NextResponse.json({ error: 'Session check failed' }, { status: 401 })
  }
}