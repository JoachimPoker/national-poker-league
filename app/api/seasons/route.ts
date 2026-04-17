import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: seasons, error } = await supabaseAdmin
      .from('seasons')
      .select('*')
      .order('year', { ascending: false })

    if (error) {
      console.error('Seasons fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ seasons: seasons || [] })
  } catch (error: any) {
    console.error('Seasons API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}