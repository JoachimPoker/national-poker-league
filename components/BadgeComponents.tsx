'use client'
import { Badge, TIER_COLORS, getTopBadges } from '@/lib/badge-definitions'

export default function BadgeGrid({ badges }: { badges: Badge[] }) {
  // Show top 3 earned badges prominently
  const topBadges = getTopBadges(badges, 3)
  const hasBadges = badges.some(b => b.earned)

  if (!hasBadges) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4 opacity-20">🏆</div>
        <div className="text-sm text-white/40 uppercase tracking-widest font-bold">
          No badges earned yet
        </div>
        <div className="text-xs text-white/30 mt-2">
          Play tournaments to unlock achievements
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Featured Top Badges */}
      {topBadges.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          {topBadges.map(badge => {
            const colors = TIER_COLORS[badge.tier] || TIER_COLORS.bronze
            return (
              <div
                key={badge.key}
                className="relative flex flex-col items-center p-4 rounded-xl border backdrop-blur-md group hover:-translate-y-1 transition-all cursor-help"
                style={{
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  boxShadow: `inset 0 0 20px ${colors.bg}, ${colors.glow}`
                }}
                title={badge.desc}
              >
                {/* Glow */}
                <div 
                  className="absolute inset-0 blur-xl rounded-xl opacity-40 group-hover:opacity-60 -z-10 transition-opacity"
                  style={{ backgroundColor: colors.color }}
                />
                
                {/* Icon */}
                <div className="text-3xl mb-2 filter drop-shadow-lg">
                  {badge.icon}
                </div>
                
                {/* Name */}
                <div 
                  className="text-[10px] font-black text-center uppercase tracking-wider"
                  style={{ color: colors.color }}
                >
                  {badge.name}
                </div>
                
                {/* Tier */}
                <div 
                  className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border"
                  style={{
                    backgroundColor: colors.color,
                    borderColor: colors.border,
                    color: '#000',
                  }}
                >
                  {badge.tier}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Badge Stats */}
      <div className="flex justify-between items-center text-xs text-white/40 uppercase tracking-widest font-bold mb-4 pb-3 border-b border-white/10">
        <span>{badges.filter(b => b.earned).length} Earned</span>
        <span>{badges.length} Total</span>
      </div>

      {/* All Badges by Category */}
      <div className="space-y-4">
        {getCategories(badges).map(cat => {
          const categoryBadges = badges.filter(b => b.category === cat)
          const earnedCount = categoryBadges.filter(b => b.earned).length
          
          return (
            <details key={cat} className="group" open={earnedCount > 0}>
              <summary className="flex justify-between items-center cursor-pointer list-none p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-cyan-400/80 text-[10px] font-black uppercase tracking-[3px]">
                    {cat}
                  </span>
                  <span className="text-[9px] text-white/30 font-mono">
                    {earnedCount}/{categoryBadges.length}
                  </span>
                </div>
                <span className="text-white/40 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              
              <div className="mt-3 grid grid-cols-4 gap-2 pl-2">
                {categoryBadges.map(badge => (
                  <MiniBadgeCard key={badge.key} badge={badge} />
                ))}
              </div>
            </details>
          )
        })}
      </div>
    </div>
  )
}

function MiniBadgeCard({ badge }: { badge: Badge }) {
  const colors = TIER_COLORS[badge.tier] || TIER_COLORS.bronze
  const dim = !badge.earned

  return (
    <div
      className={`relative flex flex-col items-center p-2 rounded-lg border backdrop-blur-md transition-all cursor-help ${
        dim 
          ? 'bg-black/40 border-white/5 opacity-40 hover:opacity-70' 
          : 'hover:-translate-y-1'
      }`}
      style={{
        backgroundColor: dim ? undefined : colors.bg,
        borderColor: dim ? undefined : colors.border,
        boxShadow: dim ? undefined : `0 0 10px ${colors.bg}`
      }}
      title={`${badge.name} - ${badge.desc}`}
    >
      {/* Icon */}
      <div 
        className="text-2xl mb-1"
        style={{ filter: dim ? 'grayscale(100%)' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
      >
        {badge.icon}
      </div>
      
      {/* Name */}
      <div 
        className="text-[8px] font-bold text-center leading-tight"
        style={{ color: badge.earned ? colors.color : 'rgba(255,255,255,0.2)' }}
      >
        {badge.name}
      </div>

      {/* Progress Bar for Unearned */}
      {!badge.earned && badge.progress !== undefined && (
        <div className="w-full mt-1">
          <div className="h-0.5 bg-black/60 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all"
              style={{ 
                width: `${badge.progress}%`, 
                backgroundColor: colors.color,
              }}
            />
          </div>
        </div>
      )}

      {/* Checkmark for Earned */}
      {badge.earned && (
        <div 
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border"
          style={{
            backgroundColor: colors.color,
            borderColor: colors.border,
          }}
        >
          <span className="text-black text-[8px] font-black">✓</span>
        </div>
      )}
    </div>
  )
}

function getCategories(badges: Badge[]): string[] {
  const categoryOrder = ['Wins', 'Cashes', 'Money', 'Final Tables', 'Events Played', 'Special']
  const categories = [...new Set(badges.map(b => b.category))]
  return categories.sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a)
    const bIndex = categoryOrder.indexOf(b)
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    return aIndex - bIndex
  })
}

// Compact badge chips for leaderboard rows
export function BadgeChips({ badges }: { badges: Badge[] }) {
  if (badges.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map(badge => {
        const colors = TIER_COLORS[badge.tier] || TIER_COLORS.bronze
        return (
          <div
            key={badge.key}
            title={`${badge.name} - ${badge.desc}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg backdrop-blur-md shadow-md transition-all hover:scale-110 cursor-help border"
            style={{
              background: colors.bg,
              borderColor: colors.border,
              boxShadow: `0 0 10px ${colors.bg}`
            }}
          >
            <span className="text-sm filter drop-shadow-sm">{badge.icon}</span>
            <span 
              className="text-[9px] font-black tracking-widest uppercase drop-shadow-sm"
              style={{ color: colors.color }}
            >
              {badge.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}