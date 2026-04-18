import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    const { data: badges, error } = await supabaseAdmin
      .from('badge_definitions')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('tier', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 })
    }

    return NextResponse.json({ badges })
  } catch (error) {
    console.error('Fetch badges error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    const badge = await request.json()

    const { data, error } = await supabaseAdmin
      .from('badge_definitions')
      .insert({
        key: badge.key,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        tier: badge.tier,
        category: badge.category,
        condition_type: badge.condition_type,
        condition_value: badge.condition_value,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to create badge' }, { status: 500 })
    }

    return NextResponse.json({ success: true, badge: data })
  } catch (error) {
    console.error('Create badge error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    const { id, updates } = await request.json()

    const { data, error } = await supabaseAdmin
      .from('badge_definitions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to update badge' }, { status: 500 })
    }

    return NextResponse.json({ success: true, badge: data })
  } catch (error) {
    console.error('Update badge error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}