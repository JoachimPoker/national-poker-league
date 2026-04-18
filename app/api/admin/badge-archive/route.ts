import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export async function POST(request: Request) {
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    const { action, badgeKey, reason, archivedBy } = await request.json()

    if (action === 'archive') {
      const { data: badge, error: badgeError } = await supabaseAdmin
        .from('badge_definitions')
        .select('*')
        .eq('key', badgeKey)
        .single()

      if (badgeError || !badge) {
        return NextResponse.json({ error: 'Badge not found' }, { status: 404 })
      }

      const { data: playerBadges, error: countError } = await supabaseAdmin
        .from('player_badges')
        .select('player_id, awarded_at, players(full_name)')
        .eq('badge_key', badgeKey)

      if (countError) {
        return NextResponse.json({ error: 'Failed to count player badges' }, { status: 500 })
      }

      const playerCount = playerBadges?.length || 0

      const { error: archiveError } = await supabaseAdmin
        .from('archived_badges')
        .insert({
          badge_key: badge.key,
          badge_name: badge.name,
          badge_description: badge.description,
          badge_icon: badge.icon,
          badge_tier: badge.tier,
          badge_category: badge.category,
          player_count: playerCount,
          archived_by: archivedBy || 'Unknown',
          reason: reason || 'No reason provided'
        })

      if (archiveError) {
        return NextResponse.json({ error: 'Failed to archive badge' }, { status: 500 })
      }

      if (playerBadges && playerBadges.length > 0) {
        const archivedPlayerBadges = playerBadges.map((pb: any) => ({
          badge_key: badgeKey,
          player_id: pb.player_id,
          player_name: pb.players?.full_name || 'Unknown',
          awarded_at: pb.awarded_at
        }))

        const { error: archivePlayerError } = await supabaseAdmin
          .from('archived_player_badges')
          .insert(archivedPlayerBadges)

        if (archivePlayerError) {
          console.error('Failed to archive player badges:', archivePlayerError)
        }
      }

      const { error: deactivateError } = await supabaseAdmin
        .from('badge_definitions')
        .update({ is_active: false })
        .eq('key', badgeKey)

      if (deactivateError) {
        return NextResponse.json({ error: 'Failed to deactivate badge' }, { status: 500 })
      }

      const { error: deletePlayerBadgesError } = await supabaseAdmin
        .from('player_badges')
        .delete()
        .eq('badge_key', badgeKey)

      if (deletePlayerBadgesError) {
        return NextResponse.json({ error: 'Failed to remove player badges' }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        message: `Badge archived successfully. ${playerCount} player badge(s) moved to archive.`,
        playerCount 
      })
    }

    if (action === 'restore') {
      const { error: restoreError } = await supabaseAdmin
        .from('badge_definitions')
        .update({ is_active: true })
        .eq('key', badgeKey)

      if (restoreError) {
        return NextResponse.json({ error: 'Failed to restore badge' }, { status: 500 })
      }

      const { data: archivedPlayerBadges } = await supabaseAdmin
        .from('archived_player_badges')
        .select('*')
        .eq('badge_key', badgeKey)

      if (archivedPlayerBadges && archivedPlayerBadges.length > 0) {
        const restoredBadges = archivedPlayerBadges.map((apb: any) => ({
          badge_key: apb.badge_key,
          player_id: apb.player_id,
          awarded_at: apb.awarded_at,
          awarded_by: 'Restored from Archive'
        }))

        await supabaseAdmin
          .from('player_badges')
          .insert(restoredBadges)

        await supabaseAdmin
          .from('archived_player_badges')
          .delete()
          .eq('badge_key', badgeKey)
      }

      await supabaseAdmin
        .from('archived_badges')
        .delete()
        .eq('badge_key', badgeKey)

      return NextResponse.json({ 
        success: true, 
        message: 'Badge restored successfully',
        playerCount: archivedPlayerBadges?.length || 0
      })
    }

    if (action === 'hard_delete') {
      await supabaseAdmin
        .from('archived_player_badges')
        .delete()
        .eq('badge_key', badgeKey)

      await supabaseAdmin
        .from('archived_badges')
        .delete()
        .eq('badge_key', badgeKey)

      const { error: deleteError } = await supabaseAdmin
        .from('badge_definitions')
        .delete()
        .eq('key', badgeKey)

      if (deleteError) {
        return NextResponse.json({ error: 'Failed to delete badge permanently' }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Badge permanently deleted. This action cannot be undone.'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Badge archive error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    const { data: archivedBadges, error } = await supabaseAdmin
      .from('archived_badges')
      .select('*')
      .order('archived_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch archived badges' }, { status: 500 })
    }

    return NextResponse.json({ archivedBadges })
  } catch (error) {
    console.error('Fetch archived badges error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}