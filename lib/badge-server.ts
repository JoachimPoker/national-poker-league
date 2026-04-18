import 'server-only'
import { supabaseAdmin } from '@/lib/supabase'
import type { BadgeDefinition } from '@/lib/badge-definitions'

export async function getBadgeDefinitionsServer(): Promise<BadgeDefinition[]> {
  const { data, error } = await supabaseAdmin
    .from('badge_definitions')
    .select('*')
    .eq('is_active', true) // 👈 ADD THIS LINE - Only fetch active badges
    .order('tier', { ascending: true })
    .order('category', { ascending: true })

  if (error) {
    console.error('Error fetching badge definitions:', error)
    return []
  }

  return data || []
}