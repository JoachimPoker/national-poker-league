import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  const authError = await requireAdmin()
  if (authError) return authError

  const { data: badges } = await supabaseAdmin
    .from('badge_definitions')
    .select('*')
    .order('display_order', { ascending: true })

  return NextResponse.json({ badges: badges || [] })
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  const body = await request.json()
  const { key, name, description, icon, image_url, tier, category, condition_type, condition_value, display_order } = body

  if (!key || !name || !description || !tier || !category || !condition_type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!icon && !image_url) {
    return NextResponse.json({ error: 'Must provide either icon or image_url' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('badge_definitions')
    .insert({
      key, name, description,
      icon: icon || null,
      image_url: image_url || null,
      tier, category, condition_type,
      condition_value: condition_value || {},
      is_active: true,
      display_order: display_order || 999
    })

  if (error) {
    if (error.message.includes('unique')) {
      return NextResponse.json({ error: 'A badge with this key already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const body = await request.json()

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 })
  }

  if (body.is_active !== undefined && Object.keys(body).length === 1) {
    const { error } = await supabaseAdmin
      .from('badge_definitions')
      .update({ is_active: body.is_active })
      .eq('id', parseInt(id))

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  const { name, description, icon, image_url, tier, category, condition_type, condition_value, display_order } = body

  if (!name || !description || !tier || !category || !condition_type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!icon && !image_url) {
    return NextResponse.json({ error: 'Must provide either icon or image_url' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('badge_definitions')
    .update({
      name, description,
      icon: icon || null,
      image_url: image_url || null,
      tier, category, condition_type,
      condition_value: condition_value || {},
      display_order: display_order || 999,
      updated_at: new Date().toISOString()
    })
    .eq('id', parseInt(id))

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
    .from('badge_definitions')
    .delete()
    .eq('id', parseInt(id))

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}