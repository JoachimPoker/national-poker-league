'use client'
import { Badge, TIER_COLORS } from '@/lib/badge-definitions'

export default function BadgeGrid({ badges }: { badges: Badge[] }) {
  const categories = [...new Set(badges.map(b => b.category))]

  return (
    <div className="flex flex-col gap-10">
      {categories.map(cat => {
        const categoryBadges = badges.filter(b => b.category === cat)
        const earnedCount = categoryBadges.filter(b => b.earned).length
        
        return (
          <div key={cat} className="relative">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-3">
              <div className="text-[11px] font-black text-cyan-400/90 tracking-[4px] uppercase drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                {cat}
              </div>
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                {earnedCount} / {categoryBadges.length}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {categoryBadges.map(badge => (
                <BadgeCard key={badge.key} badge={badge} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function BadgeCard({ badge }: { badge: Badge }) {
  const colors = TIER_COLORS[badge.tier]
  const dim = !badge.earned
  const hasImage = badge.image_url && badge.image_url.trim() !== ''

  return (
    <div
      className={`group relative flex flex-col items-center p-5 rounded-2xl border backdrop-blur-md transition-all duration-500 cursor-help ${
        dim 
          ? 'bg-black/40 border-white/5 opacity-60 hover:opacity-90 hover:border-white/10' 
          : 'border-white/10 hover:-translate-y-2 hover:shadow-2xl'
      }`}
      style={{
        backgroundColor: dim ? undefined : colors.bg,
        borderColor: dim ? undefined : colors.border,
        boxShadow: dim ? undefined : `inset 0 0 20px ${colors.bg}, ${colors.glow}`
      }}
      title={badge.desc}
    >
      {/* Ambient Glow for Earned Badges */}
      {!dim && (
        <div 
          className="absolute inset-0 blur-xl rounded-2xl opacity-40 pointer-events-none transition-opacity group-hover:opacity-70 -z-10"
          style={{ backgroundColor: colors.color }}
        />
      )}

      {/* Icon/Image Container */}
      <div className="relative mb-4">
        <div 
          className={`w-20 h-20 rounded-xl flex items-center justify-center text-4xl transition-all shadow-lg overflow-hidden ${
            dim ? 'bg-black/60 border border-white/5' : 'border-2'
          }`}
          style={{
            borderColor: dim ? undefined : colors.border,
            backgroundColor: dim ? undefined : `${colors.bg}`,
            filter: dim ? 'grayscale(100%) opacity(50%)' : hasImage ? 'none' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))'
          }}
        >
          {hasImage ? (
            <img 
              src={badge.image_url} 
              alt={badge.name}
              className="w-full h-full object-cover"
              style={{ filter: dim ? 'grayscale(100%) opacity(50%)' : 'none' }}
            />
          ) : (
            badge.icon
          )}
        </div>

        {/* Tier Badge */}
        {!dim && (
          <div 
            className="absolute -top-2 -right-2 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border shadow-lg"
            style={{
              backgroundColor: colors.color,
              borderColor: colors.border,
              color: '#000',
            }}
          >
            {badge.tier}
          </div>
        )}
      </div>

      {/* Badge Name */}
      <div 
        className="text-sm font-black text-center leading-tight tracking-tight mb-1 transition-colors"
        style={{ color: badge.earned ? colors.color : 'rgba(255,255,255,0.3)' }}
      >
        {badge.name}
      </div>

      {/* Rarity */}
      <div 
        className="text-[9px] text-center tracking-[2px] font-bold uppercase mb-2"
        style={{ color: badge.earned ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)' }}
      >
        {badge.rarity}
      </div>

      {/* Description */}
      <div className="text-[10px] text-center text-white/40 leading-snug mb-3 min-h-[2.5rem] flex items-center">
        {badge.desc}
      </div>

      {/* Progress Bar for Unearned Badges */}
      {!badge.earned && badge.progress !== undefined && (
        <div className="w-full space-y-2">
          <div className="h-1.5 bg-black/80 border border-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_currentColor]"
              style={{ 
                width: `${badge.progress}%`, 
                backgroundColor: colors.color,
                boxShadow: `0 0 10px ${colors.color}`
              }}
            />
          </div>
          <div 
            className="text-[9px] text-center uppercase tracking-widest font-black transition-colors"
            style={{ color: badge.earned ? colors.color : 'rgba(255,255,255,0.3)' }}
          >
            {badge.progressLabel}
          </div>
        </div>
      )}

      {/* Earned Checkmark */}
      {badge.earned && (
        <div 
          className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center border-2 shadow-lg"
          style={{
            backgroundColor: colors.color,
            borderColor: colors.border,
            boxShadow: `0 0 15px ${colors.color}`
          }}
        >
          <span className="text-black text-xs font-black">✓</span>
        </div>
      )}
    </div>
  )
}

// Compact badge chips for leaderboard rows
export function BadgeChips({ badges }: { badges: Badge[] }) {
  if (badges.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map(badge => {
        const colors = TIER_COLORS[badge.tier]
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