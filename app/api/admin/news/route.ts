import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  const authError = await requireAdmin()
  if (authError) return authError

  const { data: posts } = await supabaseAdmin
    .from('news')
    .select('*')
    .order('published_at', { ascending: false })

  return NextResponse.json({ posts: posts || [] })
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  const body = await request.json()
  const { title, content, social_link } = body

  if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('news')
    .insert({ title, content, social_link, published_at: new Date().toISOString() })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('news')
    .delete()
    .eq('id', parseInt(id))

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}