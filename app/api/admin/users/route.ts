import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  const authError = await requireAdmin()
  if (authError) return authError

  const { data: users } = await supabaseAdmin
    .from('admin_users')
    .select('id, name, email, created_at')
    .order('created_at')

  return NextResponse.json({ users: users || [] })
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  const body = await request.json()
  const { name, email, password } = body

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  const password_hash = await bcrypt.hash(password, 12)

  const { error } = await supabaseAdmin
    .from('admin_users')
    .insert({ name, email, password_hash })

  if (error) {
    if (error.message.includes('unique')) {
      return NextResponse.json({ error: 'An admin with this email already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('admin_users')
    .delete()
    .eq('id', parseInt(id))

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}