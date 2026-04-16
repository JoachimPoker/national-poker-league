export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'special' | 'elite'

export interface Badge {
  key: string
  name: string
  desc: string
  icon: string
  tier: BadgeTier
  category: string
  earned: boolean
  progress?: number
  progressLabel?: string
}

export const TIER_COLORS: Record<BadgeTier, { color: string; bg: string; border: string }> = {
  bronze:   { color: '#cd7f32', bg: 'rgba(205,127,50,0.12)',   border: 'rgba(205,127,50,0.3)' },
  silver:   { color: '#b0b8c8', bg: 'rgba(176,184,200,0.12)', border: 'rgba(176,184,200,0.3)' },
  gold:     { color: '#FBF091', bg: 'rgba(197,160,82,0.15)',   border: 'rgba(197,160,82,0.35)' },
  platinum: { color: '#a0d8ff', bg: 'rgba(160,216,255,0.12)', border: 'rgba(160,216,255,0.3)' },
  special:  { color: '#4379FF', bg: 'rgba(67,121,255,0.12)',   border: 'rgba(67,121,255,0.3)' },
  elite:    { color: '#e8c870', bg: 'rgba(232,200,112,0.12)', border: 'rgba(232,200,112,0.3)' },
}

export const ALL_BADGES: Omit<Badge, 'earned' | 'progress' | 'progressLabel'>[] = [
  // Event wins
  { key: 'win_bronze',   name: 'Event Winner', desc: 'Win 1 event',   icon: '♠', tier: 'bronze',   category: 'Wins' },
  { key: 'win_silver',   name: 'Event Winner', desc: 'Win 5 events',  icon: '♠', tier: 'silver',   category: 'Wins' },
  { key: 'win_gold',     name: 'Event Winner', desc: 'Win 10 events', icon: '♠', tier: 'gold',     category: 'Wins' },
  { key: 'win_platinum', name: 'Event Winner', desc: 'Win 25 events', icon: '♠', tier: 'platinum', category: 'Wins' },

  // Cashes
  { key: 'cash_bronze',   name: 'Casher', desc: '5 cashes lifetime',   icon: '♦', tier: 'bronze',   category: 'Cashes' },
  { key: 'cash_silver',   name: 'Casher', desc: '20 cashes lifetime',  icon: '♦', tier: 'silver',   category: 'Cashes' },
  { key: 'cash_gold',     name: 'Casher', desc: '50 cashes lifetime',  icon: '♦', tier: 'gold',     category: 'Cashes' },
  { key: 'cash_platinum', name: 'Casher', desc: '100 cashes lifetime', icon: '♦', tier: 'platinum', category: 'Cashes' },

  // Events played
  { key: 'played_bronze',   name: 'Veteran', desc: '10 events played lifetime',  icon: '♣', tier: 'bronze',   category: 'Events Played' },
  { key: 'played_silver',   name: 'Veteran', desc: '25 events played lifetime',  icon: '♣', tier: 'silver',   category: 'Events Played' },
  { key: 'played_gold',     name: 'Veteran', desc: '50 events played lifetime',  icon: '♣', tier: 'gold',     category: 'Events Played' },
  { key: 'played_platinum', name: 'Veteran', desc: '100 events played lifetime', icon: '♣', tier: 'platinum', category: 'Events Played' },

  // Prize money
  { key: 'prize_bronze',   name: 'Money Maker', desc: '£10,000 lifetime prize money',  icon: '£', tier: 'bronze',   category: 'Prize Money' },
  { key: 'prize_silver',   name: 'Money Maker', desc: '£50,000 lifetime prize money',  icon: '£', tier: 'silver',   category: 'Prize Money' },
  { key: 'prize_gold',     name: 'Money Maker', desc: '£100,000 lifetime prize money', icon: '£', tier: 'gold',     category: 'Prize Money' },
  { key: 'prize_platinum', name: 'Money Maker', desc: '£250,000 lifetime prize money', icon: '£', tier: 'platinum', category: 'Prize Money' },

  // Special
  { key: 'first_cash',      name: 'First Cash',     desc: 'First ever cash in any event',            icon: '★', tier: 'bronze',   category: 'Special' },
  { key: 'final_table',     name: 'Final Table',    desc: 'Finished top 9 in any event',             icon: '◆', tier: 'silver',   category: 'Special' },
  { key: 'hr_cash',         name: 'High Roller',    desc: 'Cashed in a High Roller event',           icon: '★', tier: 'gold',     category: 'Special' },
  { key: 'hr_win',          name: 'HR Champion',    desc: 'Won a High Roller event',                 icon: '★', tier: 'elite',    category: 'Special' },
  { key: 'lr_win',          name: 'LR Champion',    desc: 'Won a Low Roller event',                  icon: '★', tier: 'special',  category: 'Special' },
  { key: 'road_warrior',    name: 'Road Warrior',   desc: 'Won events at 5+ different venues',       icon: '◆', tier: 'gold',     category: 'Special' },
  { key: 'venue_explorer',  name: 'Venue Explorer', desc: 'Cashed at every active venue',            icon: '◆', tier: 'platinum', category: 'Special' },
  { key: 'back_to_back',    name: 'Back to Back',   desc: 'Won two consecutive events',              icon: '⚡', tier: 'gold',     category: 'Special' },
  { key: 'repeat_champion', name: 'Repeat Champ',   desc: 'Won same event in different seasons',     icon: '👑', tier: 'elite',    category: 'Special' },

  // Leaderboard
  { key: 'npl_top10',  name: 'NPL Top 10',   desc: 'Finished top 10 on the NPL leaderboard', icon: '⚡', tier: 'bronze', category: 'Leaderboard' },
  { key: 'npl_top3',   name: 'NPL Podium',   desc: 'Finished top 3 on the NPL leaderboard',  icon: '🏆', tier: 'silver', category: 'Leaderboard' },
  { key: 'npl_winner', name: 'NPL Champion', desc: 'Won the NPL seasonal leaderboard',        icon: '👑', tier: 'elite',  category: 'Leaderboard' },
  { key: 'hr_winner',  name: 'HR Champion',  desc: 'Won the High Roller leaderboard',         icon: '👑', tier: 'elite',  category: 'Leaderboard' },
  { key: 'lr_winner',  name: 'LR Champion',  desc: 'Won the Low Roller leaderboard',          icon: '👑', tier: 'elite',  category: 'Leaderboard' },
]

export interface PlayerStats {
  seasonResults: any[]
  seasonHRResults: any[]
  seasonLRResults: any[]
  nplRank: number
  lifetimeWins: number
  lifetimeCashes: number
  lifetimePrizeMoney: number
  hasBackToBack: boolean
  hasRepeatChampion: boolean
  uniqueWinVenues: number
  uniqueCashVenues: string[]
  allVenues: string[]
  manualBadges: string[]
}

export function calculateBadges(stats: PlayerStats): Badge[] {
  const earned = new Set<string>()
  const lc = stats.lifetimeCashes
  const lw = stats.lifetimeWins
  const lp = stats.lifetimePrizeMoney

  if (lw >= 1)  earned.add('win_bronze')
  if (lw >= 5)  earned.add('win_silver')
  if (lw >= 10) earned.add('win_gold')
  if (lw >= 25) earned.add('win_platinum')

  if (lc >= 5)   earned.add('cash_bronze')
  if (lc >= 20)  earned.add('cash_silver')
  if (lc >= 50)  earned.add('cash_gold')
  if (lc >= 100) earned.add('cash_platinum')

  if (lc >= 10)  earned.add('played_bronze')
  if (lc >= 25)  earned.add('played_silver')
  if (lc >= 50)  earned.add('played_gold')
  if (lc >= 100) earned.add('played_platinum')

  if (lp >= 10000)  earned.add('prize_bronze')
  if (lp >= 50000)  earned.add('prize_silver')
  if (lp >= 100000) earned.add('prize_gold')
  if (lp >= 250000) earned.add('prize_platinum')

  if (lc >= 1) earned.add('first_cash')
  if (stats.seasonResults.some(r => r.finish_position <= 9)) earned.add('final_table')
  if (stats.seasonHRResults.length > 0) earned.add('hr_cash')
  if (stats.seasonHRResults.some(r => r.finish_position === 1)) earned.add('hr_win')
  if (stats.seasonLRResults.some(r => r.finish_position === 1)) earned.add('lr_win')
  if (stats.uniqueWinVenues >= 5) earned.add('road_warrior')
  if (stats.allVenues.length > 0 && stats.allVenues.every(v => stats.uniqueCashVenues.includes(v))) earned.add('venue_explorer')
  if (stats.hasBackToBack) earned.add('back_to_back')
  if (stats.hasRepeatChampion) earned.add('repeat_champion')

  if (stats.nplRank > 0 && stats.nplRank <= 10) earned.add('npl_top10')
  if (stats.nplRank > 0 && stats.nplRank <= 3)  earned.add('npl_top3')
  if (stats.nplRank === 1) earned.add('npl_winner')

  for (const key of stats.manualBadges) earned.add(key)

  const progressMap: Record<string, { current: number; target: number }> = {
    win_bronze:    { current: lw, target: 1 },
    win_silver:    { current: lw, target: 5 },
    win_gold:      { current: lw, target: 10 },
    win_platinum:  { current: lw, target: 25 },
    cash_bronze:   { current: lc, target: 5 },
    cash_silver:   { current: lc, target: 20 },
    cash_gold:     { current: lc, target: 50 },
    cash_platinum: { current: lc, target: 100 },
    played_bronze:   { current: lc, target: 10 },
    played_silver:   { current: lc, target: 25 },
    played_gold:     { current: lc, target: 50 },
    played_platinum: { current: lc, target: 100 },
    prize_bronze:   { current: lp, target: 10000 },
    prize_silver:   { current: lp, target: 50000 },
    prize_gold:     { current: lp, target: 100000 },
    prize_platinum: { current: lp, target: 250000 },
  }

  return ALL_BADGES.map(badge => {
    const isEarned = earned.has(badge.key)
    const prog = progressMap[badge.key]
    return {
      ...badge,
      earned: isEarned,
      progress: prog ? Math.min(100, Math.round((prog.current / prog.target) * 100)) : undefined,
      progressLabel: prog
        ? badge.key.startsWith('prize')
          ? `£${prog.current.toLocaleString()} / £${prog.target.toLocaleString()}`
          : `${prog.current} / ${prog.target}`
        : undefined,
    }
  })
}

export function getTopBadges(badges: Badge[], max = 3): Badge[] {
  const tierOrder: BadgeTier[] = ['elite', 'platinum', 'gold', 'special', 'silver', 'bronze']
  return badges
    .filter(b => b.earned)
    .sort((a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier))
    .slice(0, max)
}