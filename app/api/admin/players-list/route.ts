import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  const authError = await requireAdmin()
  if (authError) return authError

  const { data: players } = await supabaseAdmin
    .from('players')
    .select('id, full_name')
    .eq('gdpr', true)
    .order('full_name')

  return NextResponse.json({ players: players || [] })
}