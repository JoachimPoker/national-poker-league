'use client'
import { Badge, TIER_COLORS } from '@/lib/badge-definitions'

export default function BadgeGrid({ badges }: { badges: Badge[] }) {
  const categories = [...new Set(badges.map(b => b.category))]

  return (
    <div className="flex flex-col gap-8">
      {categories.map(cat => (
        <div key={cat} className="relative">
          <div className="text-[10px] font-black text-cyan-400/80 tracking-[4px] uppercase mb-5 border-b border-white/10 pb-2 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]">
            {cat}
          </div>
          <div className="flex flex-wrap gap-6">
            {badges.filter(b => b.category === cat).map(badge => (
              <BadgeHex key={badge.key} badge={badge} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function BadgeHex({ badge }: { badge: Badge }) {
  const colors = TIER_COLORS[badge.tier]
  const dim = !badge.earned

  return (
    <div
      className={`group flex flex-col items-center gap-2.5 w-[90px] relative transition-all duration-500 ${
        dim ? 'opacity-50 hover:opacity-80' : 'opacity-100 hover:-translate-y-1'
      }`}
      title={badge.earned ? badge.desc : `${badge.desc} — not yet earned`}
    >
      {/* Hexagon shape & Glow */}
      <div className="relative flex items-center justify-center cursor-help">
        
        {/* Ambient Glow for Earned Badges */}
        {!dim && (
          <div 
            className="absolute inset-0 blur-[15px] rounded-full opacity-60 pointer-events-none transition-opacity group-hover:opacity-100"
            style={{ backgroundColor: colors.color }}
          />
        )}

        {/* The Hexagon */}
        <div 
          className="w-[64px] h-[72px] relative flex items-center justify-center transition-all shadow-inner"
          style={{
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            background: dim ? 'rgba(0, 0, 0, 0.6)' : colors.bg,
            border: dim ? '1px solid rgba(255,255,255,0.05)' : `1px solid ${colors.border}`
          }}
        >
          <span 
            className={`transition-all ${badge.icon.length > 1 ? 'text-2xl' : 'text-3xl'}`}
            style={{ filter: dim ? 'grayscale(100%) opacity(40%)' : 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }}
          >
            {badge.icon}
          </span>

          {/* Earned indicator dot */}
          {badge.earned && (
            <div 
              className="absolute bottom-2 right-3 w-2.5 h-2.5 rounded-full border border-[#0A0A10] shadow-[0_0_8px_currentColor]"
              style={{ backgroundColor: colors.color, color: colors.color }}
            />
          )}
        </div>
      </div>

      <div className="flex flex-col items-center w-full">
        {/* Badge name */}
        <div 
          className="text-[11px] font-black text-center leading-tight tracking-tight mb-1"
          style={{ color: badge.earned ? colors.color : 'rgba(255,255,255,0.4)' }}
        >
          {badge.name}
        </div>

        {/* Tier label */}
        <div 
          className="text-[8px] text-center tracking-[2px] font-bold uppercase"
          style={{ color: badge.earned ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)' }}
        >
          {badge.tier}
        </div>

        {/* Progress bar for unearned tiered badges */}
        {!badge.earned && badge.progress !== undefined && (
          <div className="w-full mt-2">
            <div className="h-1 bg-black/80 border border-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_currentColor] opacity-70 group-hover:opacity-100"
                style={{ width: `${badge.progress}%`, backgroundColor: colors.color, color: colors.color }}
              />
            </div>
            <div className="text-[8px] color-white/30 text-center mt-1.5 uppercase tracking-widest font-black text-white/30 group-hover:text-white/50 transition-colors">
              {badge.progressLabel}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Compact chip badges for leaderboard rows
export function BadgeChips({ badges }: { badges: Badge[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map(badge => {
        const colors = TIER_COLORS[badge.tier]
        return (
          <div
            key={badge.key}
            title={badge.name}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md backdrop-blur-md shadow-sm transition-transform hover:scale-105 cursor-help"
            style={{
              background: colors.bg,
              borderColor: colors.border,
              borderWidth: '1px'
            }}
          >
            <span className="text-xs filter drop-shadow-sm">{badge.icon}</span>
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