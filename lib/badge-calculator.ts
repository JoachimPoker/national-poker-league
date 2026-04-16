// lib/badge-calculator.ts
// Complete badge calculation and auto-award system

import { supabaseAdmin } from '@/lib/supabase'

export interface PlayerStats {
  player_id: number
  full_name: string
  lifetime_wins: number
  lifetime_cashes: number
  lifetime_money_won: number
  lifetime_final_tables: number
  lifetime_events_played: number
}

export interface BadgeDefinition {
  id: number
  key: string
  name: string
  description: string
  icon: string
  image_url?: string
  tier: 'bronze' | 'silver' | 'gold' | 'purple'
  category: string
  condition_type: string
  condition_value: any
  rarity: string
  display_order: number
}

export interface BadgeProgress {
  badge: BadgeDefinition
  earned: boolean
  progress: number
  progressLabel: string
  currentValue: number
  targetValue: number
}

// ============================================================================
// BADGE CALCULATION LOGIC
// ============================================================================

/**
 * Calculate all badges for a player
 */
export async function calculatePlayerBadges(playerId: number): Promise<BadgeProgress[]> {
  // Get player stats
  const { data: player } = await supabaseAdmin
    .from('players')
    .select('id, full_name, lifetime_wins, lifetime_cashes, lifetime_money_won, lifetime_final_tables, lifetime_events_played')
    .eq('id', playerId)
    .single()

  if (!player) throw new Error('Player not found')

  // Get all active badge definitions
  const { data: badgeDefs } = await supabaseAdmin
    .from('badge_definitions')
    .select('*')
    .eq('is_active', true)
    .in('condition_type', ['wins', 'cashes', 'money', 'final_tables', 'events_played'])
    .order('display_order')

  if (!badgeDefs) return []

  // Get already awarded badges
  const { data: awardedBadges } = await supabaseAdmin
    .from('player_badges')
    .select('badge_key')
    .eq('player_id', playerId)

  const awardedKeys = new Set(awardedBadges?.map(b => b.badge_key) || [])

  // Calculate progress for each badge
  const progress: BadgeProgress[] = badgeDefs.map(badge => {
    const earned = awardedKeys.has(badge.key)
    const { progress: pct, label, current, target } = calculateBadgeProgress(badge, player)

    return {
      badge,
      earned,
      progress: pct,
      progressLabel: label,
      currentValue: current,
      targetValue: target
    }
  })

  return progress
}

/**
 * Calculate progress towards a specific badge
 */
function calculateBadgeProgress(badge: BadgeDefinition, player: PlayerStats) {
  const conditionValue = badge.condition_value
  let current = 0
  let target = 0

  switch (badge.condition_type) {
    case 'wins':
      current = player.lifetime_wins || 0
      target = conditionValue.min || 0
      break
    
    case 'cashes':
      current = player.lifetime_cashes || 0
      target = conditionValue.min || 0
      break
    
    case 'money':
      current = player.lifetime_money_won || 0
      target = conditionValue.min || 0
      break
    
    case 'final_tables':
      current = player.lifetime_final_tables || 0
      target = conditionValue.min || 0
      break
    
    case 'events_played':
      current = player.lifetime_events_played || 0
      target = conditionValue.min || 0
      break
    
    default:
      return { progress: 0, label: 'N/A', current: 0, target: 0 }
  }

  const progress = target > 0 ? Math.min(100, (current / target) * 100) : 0
  const label = `${current} / ${target}`

  return { progress, label, current, target }
}

// ============================================================================
// AUTO-AWARD SYSTEM
// ============================================================================

/**
 * Auto-award all eligible badges for a player
 */
export async function autoAwardBadges(playerId: number): Promise<{ awarded: string[], alreadyHad: string[] }> {
  const awarded: string[] = []
  const alreadyHad: string[] = []

  // Get player stats
  const { data: player } = await supabaseAdmin
    .from('players')
    .select('id, full_name, lifetime_wins, lifetime_cashes, lifetime_money_won, lifetime_final_tables, lifetime_events_played, gdpr')
    .eq('id', playerId)
    .single()

  if (!player) throw new Error('Player not found')
  if (!player.gdpr) return { awarded, alreadyHad } // Respect GDPR

  // Get all progressive badge definitions
  const { data: badgeDefs } = await supabaseAdmin
    .from('badge_definitions')
    .select('*')
    .eq('is_active', true)
    .in('condition_type', ['wins', 'cashes', 'money', 'final_tables', 'events_played'])
    .order('display_order')

  if (!badgeDefs) return { awarded, alreadyHad }

  // Get already awarded badges
  const { data: existing } = await supabaseAdmin
    .from('player_badges')
    .select('badge_key')
    .eq('player_id', playerId)

  const awardedKeys = new Set(existing?.map(b => b.badge_key) || [])

  // Check each badge
  for (const badge of badgeDefs) {
    const eligible = checkBadgeEligibility(badge, player)
    
    if (eligible) {
      if (awardedKeys.has(badge.key)) {
        alreadyHad.push(badge.key)
      } else {
        // Award badge
        await awardBadge(playerId, badge.key, null, 'Auto-Award System')
        awarded.push(badge.key)
      }
    }
  }

  // Update player badge count
  await updatePlayerBadgeCount(playerId)

  return { awarded, alreadyHad }
}

/**
 * Check if player is eligible for a badge
 */
function checkBadgeEligibility(badge: BadgeDefinition, player: PlayerStats): boolean {
  const conditionValue = badge.condition_value
  let current = 0
  let required = 0

  switch (badge.condition_type) {
    case 'wins':
      current = player.lifetime_wins || 0
      required = conditionValue.min || 0
      return current >= required
    
    case 'cashes':
      current = player.lifetime_cashes || 0
      required = conditionValue.min || 0
      return current >= required
    
    case 'money':
      current = player.lifetime_money_won || 0
      required = conditionValue.min || 0
      return current >= required
    
    case 'final_tables':
      current = player.lifetime_final_tables || 0
      required = conditionValue.min || 0
      return current >= required
    
    case 'events_played':
      current = player.lifetime_events_played || 0
      required = conditionValue.min || 0
      return current >= required
    
    default:
      return false
  }
}

/**
 * Award a badge to a player
 */
export async function awardBadge(
  playerId: number, 
  badgeKey: string, 
  seasonYear: number | null = null,
  awardedBy: string = 'System'
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('player_badges')
      .insert({
        player_id: playerId,
        badge_key: badgeKey,
        season_year: seasonYear,
        awarded_by: awardedBy,
        awarded_at: new Date().toISOString()
      })

    if (error) {
      // Check if already awarded (unique constraint)
      if (error.message.includes('duplicate') || error.message.includes('unique')) {
        return false // Already has badge
      }
      throw error
    }

    return true
  } catch (err) {
    console.error('Error awarding badge:', err)
    return false
  }
}

/**
 * Revoke a badge from a player
 */
export async function revokeBadge(playerId: number, badgeKey: string, seasonYear: number | null = null): Promise<boolean> {
  try {
    const query = supabaseAdmin
      .from('player_badges')
      .delete()
      .eq('player_id', playerId)
      .eq('badge_key', badgeKey)

    if (seasonYear) {
      query.eq('season_year', seasonYear)
    }

    const { error } = await query

    if (error) throw error

    // Update badge count
    await updatePlayerBadgeCount(playerId)

    return true
  } catch (err) {
    console.error('Error revoking badge:', err)
    return false
  }
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Auto-award badges for ALL players
 */
export async function autoAwardAllPlayers(): Promise<{ totalAwarded: number, playersProcessed: number }> {
  let totalAwarded = 0
  let playersProcessed = 0

  // Get all players with GDPR consent
  const { data: players } = await supabaseAdmin
    .from('players')
    .select('id')
    .eq('gdpr', true)

  if (!players) return { totalAwarded: 0, playersProcessed: 0 }

  // Process each player
  for (const player of players) {
    const { awarded } = await autoAwardBadges(player.id)
    totalAwarded += awarded.length
    playersProcessed++

    // Add small delay to avoid rate limits
    if (playersProcessed % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  return { totalAwarded, playersProcessed }
}

/**
 * Update lifetime stats for a player
 */
export async function updatePlayerLifetimeStats(playerId: number): Promise<void> {
  const { data: results } = await supabaseAdmin
    .from('results')
    .select('position, prize, tournament_id')
    .eq('player_id', playerId)

  if (!results) return

  const lifetime_events_played = new Set(results.map(r => r.tournament_id)).size
  const lifetime_wins = results.filter(r => r.position === 1).length
  const lifetime_cashes = results.filter(r => r.prize > 0).length
  const lifetime_money_won = results.reduce((sum, r) => sum + (r.prize || 0), 0)
  const lifetime_final_tables = results.filter(r => r.position <= 9).length

  await supabaseAdmin
    .from('players')
    .update({
      lifetime_events_played,
      lifetime_wins,
      lifetime_cashes,
      lifetime_money_won,
      lifetime_final_tables
    })
    .eq('id', playerId)
}

/**
 * Update lifetime stats for ALL players
 */
export async function updateAllPlayerLifetimeStats(): Promise<number> {
  const { data: players } = await supabaseAdmin
    .from('players')
    .select('id')

  if (!players) return 0

  for (const player of players) {
    await updatePlayerLifetimeStats(player.id)
    
    // Small delay to avoid overwhelming database
    if (players.indexOf(player) % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }

  return players.length
}

/**
 * Update badge count for a player
 */
async function updatePlayerBadgeCount(playerId: number): Promise<void> {
  const { data: badges } = await supabaseAdmin
    .from('player_badges')
    .select('badge_key')
    .eq('player_id', playerId)

  const badgeCount = new Set(badges?.map(b => b.badge_key) || []).size

  await supabaseAdmin
    .from('players')
    .update({ badge_count: badgeCount })
    .eq('id', playerId)
}

// ============================================================================
// SEASON-END OPERATIONS
// ============================================================================

/**
 * Award season ranking badges based on final leaderboard positions
 */
export async function awardSeasonRankingBadges(seasonYear: number, league: 'npl' | 'hr' = 'npl'): Promise<number> {
  // Get final leaderboard for the season
  const { data: leaderboard } = await supabaseAdmin
    .from('leaderboard_final')
    .select('player_id, position')
    .eq('season_year', seasonYear)
    .eq('league', league)
    .order('position')

  if (!leaderboard) return 0

  let awarded = 0

  for (const entry of leaderboard) {
    const position = entry.position
    let badgeKey = ''

    // Determine badge based on position
    if (position === 1) badgeKey = `${league}_champion_${seasonYear}`
    else if (position === 2) badgeKey = `${league}_runner_up_${seasonYear}`
    else if (position === 3) badgeKey = `${league}_third_${seasonYear}`
    else if (position <= 5) badgeKey = `${league}_top5_${seasonYear}`
    else if (position <= 10) badgeKey = `${league}_top10_${seasonYear}`
    else if (position <= 20) badgeKey = `${league}_top20_${seasonYear}`
    else if (position <= 30) badgeKey = `${league}_top30_${seasonYear}`
    else if (position <= 50) badgeKey = `${league}_top50_${seasonYear}`
    else if (position <= 75) badgeKey = `${league}_top75_${seasonYear}`
    else if (position <= 100) badgeKey = `${league}_top100_${seasonYear}`
    else if (position <= 150) badgeKey = `${league}_top150_${seasonYear}`
    else if (position <= 200) badgeKey = `${league}_top200_${seasonYear}`

    if (badgeKey) {
      const success = await awardBadge(entry.player_id, badgeKey, seasonYear, `Season ${seasonYear} End`)
      if (success) awarded++
    }
  }

  return awarded
}

/**
 * Award season superlative badges (Most Wins, Money Leader, etc.)
 */
export async function awardSeasonSuperlatives(seasonYear: number): Promise<number> {
  let awarded = 0

  // Most Wins
  const { data: mostWins } = await supabaseAdmin
    .from('season_stats')
    .select('player_id, wins')
    .eq('season_year', seasonYear)
    .order('wins', { ascending: false })
    .limit(1)
    .single()

  if (mostWins && mostWins.wins > 0) {
    await awardBadge(mostWins.player_id, `most_wins_${seasonYear}`, seasonYear, `Season ${seasonYear} Superlative`)
    awarded++
  }

  // Money Leader
  const { data: moneyLeader } = await supabaseAdmin
    .from('season_stats')
    .select('player_id, money_won')
    .eq('season_year', seasonYear)
    .order('money_won', { ascending: false })
    .limit(1)
    .single()

  if (moneyLeader && moneyLeader.money_won > 0) {
    await awardBadge(moneyLeader.player_id, `money_leader_${seasonYear}`, seasonYear, `Season ${seasonYear} Superlative`)
    awarded++
  }

  // Most Cashes
  const { data: mostCashes } = await supabaseAdmin
    .from('season_stats')
    .select('player_id, cashes')
    .eq('season_year', seasonYear)
    .order('cashes', { ascending: false })
    .limit(1)
    .single()

  if (mostCashes && mostCashes.cashes > 0) {
    await awardBadge(mostCashes.player_id, `most_cashes_${seasonYear}`, seasonYear, `Season ${seasonYear} Superlative`)
    awarded++
  }

  // Final Table King
  const { data: ftKing } = await supabaseAdmin
    .from('season_stats')
    .select('player_id, final_tables')
    .eq('season_year', seasonYear)
    .order('final_tables', { ascending: false })
    .limit(1)
    .single()

  if (ftKing && ftKing.final_tables > 0) {
    await awardBadge(ftKing.player_id, `ft_king_${seasonYear}`, seasonYear, `Season ${seasonYear} Superlative`)
    awarded++
  }

  return awarded
}