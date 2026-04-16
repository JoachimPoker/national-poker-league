import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data: prizes } = await supabaseAdmin
    .from('season_prizes')
    .select('*')
    .order('position_from')

  return NextResponse.json({ prizes: prizes || [] })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { league, season_id, position_from, position_to, prize_description, prize_amount } = body

  if (!league || !position_from || !prize_description) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('season_prizes')
    .insert({ league, season_id, position_from, position_to, prize_description, prize_amount })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('season_prizes')
    .delete()
    .eq('id', parseInt(id))

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}