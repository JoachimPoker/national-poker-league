// lib/badge-definitions.ts
// Badge types, calculations, and utilities (client-safe)

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legendary'

export interface Badge {
  key: string
  name: string
  desc: string
  icon: string
  image_url?: string
  tier: BadgeTier
  category: string
  earned: boolean
  progress?: number
  progressLabel?: string
  rarity?: string
}

export interface BadgeDefinition {
  id: number
  key: string
  name: string
  description: string
  icon: string
  image_url?: string
  tier: BadgeTier
  category: string
  condition_type: string
  condition_value: any
  is_active: boolean
  display_order: number
}

export const TIER_COLORS: Record<BadgeTier, { color: string; bg: string; border: string; glow: string }> = {
  bronze:    { 
    color: '#cd7f32', 
    bg: 'rgba(205,127,50,0.08)', 
    border: 'rgba(205,127,50,0.25)',
    glow: '0 0 20px rgba(205,127,50,0.3)'
  },
  silver:    { 
    color: '#c0c0c0', 
    bg: 'rgba(192,192,192,0.08)', 
    border: 'rgba(192,192,192,0.25)',
    glow: '0 0 20px rgba(192,192,192,0.3)'
  },
  gold:      { 
    color: '#ffd700', 
    bg: 'rgba(255,215,0,0.08)', 
    border: 'rgba(255,215,0,0.25)',
    glow: '0 0 20px rgba(255,215,0,0.4)'
  },
  platinum:  { 
    color: '#e5e4e2', 
    bg: 'rgba(229,228,226,0.08)', 
    border: 'rgba(229,228,226,0.25)',
    glow: '0 0 20px rgba(229,228,226,0.3)'
  },
  diamond:   { 
    color: '#b9f2ff', 
    bg: 'rgba(185,242,255,0.08)', 
    border: 'rgba(185,242,255,0.25)',
    glow: '0 0 25px rgba(185,242,255,0.5)'
  },
  legendary: { 
    color: '#ff6b35', 
    bg: 'rgba(255,107,53,0.08)', 
    border: 'rgba(255,107,53,0.25)',
    glow: '0 0 30px rgba(255,107,53,0.6)'
  },
}

export const TIER_RARITY: Record<BadgeTier, string> = {
  bronze: 'Common',
  silver: 'Uncommon',
  gold: 'Rare',
  platinum: 'Epic',
  diamond: 'Legendary',
  legendary: 'Mythic'
}

export interface PlayerStats {
  seasonResults: any[]
  seasonHRResults: any[]
  seasonLRResults: any[]
  nplRank: number
  lifetimeWins: number
  lifetimeCashes: number
  lifetimeEventsPlayed: number
  lifetimePrizeMoney: number
  hasBackToBack: boolean
  hasRepeatChampion: boolean
  uniqueWinVenues: number
  uniqueCashVenues: string[]
  allVenues: string[]
  manualBadges: string[]
}

// Check if a badge is earned based on its condition
function checkBadgeCondition(badge: BadgeDefinition, stats: PlayerStats): boolean {
  const condition = badge.condition_value || {}

  switch (badge.condition_type) {
    case 'wins':
      return stats.lifetimeWins >= (condition.min || 0)
    
    case 'cashes':
      return stats.lifetimeCashes >= (condition.min || 0)
    
    case 'events_played':
      return stats.lifetimeEventsPlayed >= (condition.min || 0)
    
    case 'prize_money':
      return stats.lifetimePrizeMoney >= (condition.min || 0)
    
    case 'leaderboard':
      if (condition.league === 'npl' && condition.position) {
        return stats.nplRank === condition.position
      }
      return false
    
    case 'special':
      switch (condition.type) {
        case 'final_table':
          return stats.seasonResults.some(r => r.finish_position <= 9)
        
        case 'hr_cash':
          return stats.seasonHRResults.length > 0
        
        case 'hr_win':
          return stats.seasonHRResults.some(r => r.finish_position === 1)
        
        case 'lr_win':
          return stats.seasonLRResults.some(r => r.finish_position === 1)
        
        case 'venue_count':
          return stats.uniqueCashVenues.length >= (condition.min || 0)
        
        case 'venue_explorer':
          return stats.allVenues.length > 0 && 
                 stats.allVenues.every(v => stats.uniqueCashVenues.includes(v))
        
        case 'back_to_back':
          return stats.hasBackToBack
        
        case 'repeat_champion':
          return stats.hasRepeatChampion
        
        case 'first_cash':
          return stats.lifetimeCashes >= 1
        
        case 'win_venues':
          return stats.uniqueWinVenues >= (condition.min || 0)
        
        default:
          return false
      }
    
    case 'custom':
      // For manual badges
      return stats.manualBadges.includes(badge.key)
    
    default:
      return false
  }
}

// Calculate progress for a badge
function calculateProgress(badge: BadgeDefinition, stats: PlayerStats): { progress?: number; label?: string } {
  const condition = badge.condition_value || {}
  let current = 0
  let target = 0

  switch (badge.condition_type) {
    case 'wins':
      current = stats.lifetimeWins
      target = condition.min || 0
      return {
        progress: Math.min(100, Math.round((current / target) * 100)),
        label: `${current} / ${target}`
      }
    
    case 'cashes':
      current = stats.lifetimeCashes
      target = condition.min || 0
      return {
        progress: Math.min(100, Math.round((current / target) * 100)),
        label: `${current} / ${target}`
      }
    
    case 'events_played':
      current = stats.lifetimeEventsPlayed
      target = condition.min || 0
      return {
        progress: Math.min(100, Math.round((current / target) * 100)),
        label: `${current} / ${target}`
      }
    
    case 'prize_money':
      current = stats.lifetimePrizeMoney
      target = condition.min || 0
      return {
        progress: Math.min(100, Math.round((current / target) * 100)),
        label: `£${current.toLocaleString()} / £${target.toLocaleString()}`
      }
    
    case 'special':
      if (condition.type === 'venue_count') {
        current = stats.uniqueCashVenues.length
        target = condition.min || 0
        return {
          progress: Math.min(100, Math.round((current / target) * 100)),
          label: `${current} / ${target} venues`
        }
      }
      if (condition.type === 'win_venues') {
        current = stats.uniqueWinVenues
        target = condition.min || 0
        return {
          progress: Math.min(100, Math.round((current / target) * 100)),
          label: `${current} / ${target} venues`
        }
      }
      return {}
    
    default:
      return {}
  }
}

// Main function to calculate all badges for a player
// Now accepts badge definitions as parameter instead of fetching them
export function calculateBadges(stats: PlayerStats, definitions: BadgeDefinition[]): Badge[] {
  return definitions.map(def => {
    const earned = checkBadgeCondition(def, stats)
    const { progress, label } = earned ? {} : calculateProgress(def, stats)
    
    return {
      key: def.key,
      name: def.name,
      desc: def.description,
      icon: def.icon,
      image_url: def.image_url,
      tier: def.tier,
      category: def.category,
      earned,
      progress,
      progressLabel: label,
      rarity: TIER_RARITY[def.tier]
    }
  })
}

export function getTopBadges(badges: Badge[], max = 5): Badge[] {
  const tierOrder: BadgeTier[] = ['legendary', 'diamond', 'platinum', 'gold', 'silver', 'bronze']
  return badges
    .filter(b => b.earned)
    .sort((a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier))
    .slice(0, max)
}