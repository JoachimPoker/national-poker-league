import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data: players } = await supabaseAdmin
    .from('players')
    .select('id, full_name')
    .eq('gdpr', true)
    .order('full_name')

  return NextResponse.json({ players: players || [] })
}