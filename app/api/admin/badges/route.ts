import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data: badges } = await supabaseAdmin
    .from('player_badges')
    .select('*, players(full_name)')
    .order('awarded_at', { ascending: false })
  return NextResponse.json({ badges: badges || [] })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { player_id, badge_key, badge_name, season_year, awarded_by } = body

  if (!player_id || !badge_key || !badge_name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('player_badges')
    .upsert({ player_id, badge_key, badge_name, season_year, awarded_by }, { onConflict: 'player_id,badge_key' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('player_badges')
    .delete()
    .eq('id', parseInt(id))

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}