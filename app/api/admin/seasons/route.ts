import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  const authError = await requireAdmin()
  if (authError) return authError

  const { data: seasons } = await supabaseAdmin
    .from('seasons')
    .select('*')
    .order('year', { ascending: false })

  return NextResponse.json({ seasons: seasons || [] })
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  const body = await request.json()
  const { name, year, npl_rule, is_active } = body

  if (!name || !year) {
    return NextResponse.json({ error: 'Name and year required' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('seasons')
    .insert({ name, year, npl_rule, is_active: is_active || false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  const body = await request.json()
  const { id } = body

  await supabaseAdmin
    .from('seasons')
    .update({ is_active: false })
    .neq('id', 0)

  const { error } = await supabaseAdmin
    .from('seasons')
    .update({ is_active: true })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}