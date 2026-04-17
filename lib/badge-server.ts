// lib/badge-server.ts
// Server-only badge operations
import 'server-only'
import { supabaseAdmin } from './supabase'

export interface BadgeDefinition {
  id: number
  key: string
  name: string
  description: string
  icon: string
  image_url?: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legendary'
  category: string
  condition_type: string
  condition_value: any
  is_active: boolean
  display_order: number
}

// Fetch badge definitions from database (server-side only)
export async function getBadgeDefinitionsServer(): Promise<BadgeDefinition[]> {
  const { data, error } = await supabaseAdmin
    .from('badge_definitions')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching badge definitions:', error)
    return []
  }

  return data || []
}