'use client'
import Link from 'next/link'
import { Badge, TIER_COLORS, getTopBadges } from '@/lib/badge-definitions'

export default function BadgeShowcase({ badges, playerId }: { badges: Badge[], playerId: number }) {
  const topBadges = getTopBadges(badges, 5) // Get top 5
  const earnedBadges = badges.filter(b => b.earned)
  const totalBadges = badges.length
  const completionRate = totalBadges > 0 ? Math.round((earnedBadges.length / totalBadges) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Showcase Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-[11px] font-black text-white/60 tracking-[4px] uppercase">
          Rarest Achievement Showcase
        </h3>
        <div className="text-[9px] text-white/40 uppercase tracking-widest font-bold">
          {earnedBadges.length} / {totalBadges}
        </div>
      </div>

      {/* Top Badges Showcase */}
      {topBadges.length > 0 ? (
        <div className="glass-panel p-6 rounded-2xl border-t border-purple-400/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 blur-[60px] rounded-full pointer-events-none"></div>
          
          {/* Featured Badges - 2 rows x 3 columns grid */}
          <div className="grid grid-cols-3 gap-3 mb-6 relative z-10">
            {/* Top row: 3 badges */}
            {topBadges.slice(0, 3).map(badge => {
              const colors = TIER_COLORS[badge.tier] || TIER_COLORS.bronze
              return (
                <div
                  key={badge.key}
                  className="group relative cursor-help"
                  title={`${badge.name} - ${badge.desc}`}
                >
                  {/* Glow */}
                  <div 
                    className="absolute inset-0 blur-xl rounded-xl opacity-40 group-hover:opacity-60 -z-10 transition-opacity"
                    style={{ backgroundColor: colors.color }}
                  />
                  
                  {/* Badge */}
                  <div
                    className="w-full aspect-square rounded-xl flex items-center justify-center text-4xl border-2 transition-all group-hover:scale-110 shadow-lg"
                    style={{
                      backgroundColor: colors.bg,
                      borderColor: colors.border,
                      boxShadow: `0 0 20px ${colors.bg}`
                    }}
                  >
                    {badge.icon}
                  </div>
                  
                  {/* Tier indicator */}
                  <div 
                    className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border shadow-lg"
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
            
            {/* Bottom row: 2 badges + More badge */}
            {topBadges.slice(3, 5).map(badge => {
              const colors = TIER_COLORS[badge.tier] || TIER_COLORS.bronze
              return (
                <div
                  key={badge.key}
                  className="group relative cursor-help"
                  title={`${badge.name} - ${badge.desc}`}
                >
                  {/* Glow */}
                  <div 
                    className="absolute inset-0 blur-xl rounded-xl opacity-40 group-hover:opacity-60 -z-10 transition-opacity"
                    style={{ backgroundColor: colors.color }}
                  />
                  
                  {/* Badge */}
                  <div
                    className="w-full aspect-square rounded-xl flex items-center justify-center text-4xl border-2 transition-all group-hover:scale-110 shadow-lg"
                    style={{
                      backgroundColor: colors.bg,
                      borderColor: colors.border,
                      boxShadow: `0 0 20px ${colors.bg}`
                    }}
                  >
                    {badge.icon}
                  </div>
                  
                  {/* Tier indicator */}
                  <div 
                    className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border shadow-lg"
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

            {/* +More Badge (bottom right) */}
            <Link
              href={`/players/${playerId}/achievements`}
              className="w-full aspect-square rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 border-2 border-cyan-400/30 hover:border-cyan-400/50 flex items-center justify-center transition-all hover:scale-110 shadow-lg group"
            >
              <div className="text-center">
                <div className="text-3xl font-black text-cyan-400 group-hover:text-cyan-300">
                  +{earnedBadges.length > 5 ? earnedBadges.length - 5 : 0}
                </div>
                <div className="text-[8px] text-white/60 uppercase tracking-wider font-bold">More</div>
              </div>
            </Link>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-6 mb-6 relative z-10">
            <div>
              <div className="text-3xl font-black text-white mb-1">
                {earnedBadges.length.toLocaleString()}
              </div>
              <div className="text-[9px] text-white/40 uppercase tracking-[2px] font-bold">
                Achievements
              </div>
            </div>
            
            <div>
              <div className="text-3xl font-black text-gold-gradient mb-1">
                {topBadges.length}
              </div>
              <div className="text-[9px] text-white/40 uppercase tracking-[2px] font-bold">
                Elite Badges
              </div>
            </div>
            
            <div>
              <div className="text-3xl font-black text-cyan-400 mb-1">
                {completionRate}%
              </div>
              <div className="text-[9px] text-white/40 uppercase tracking-[2px] font-bold">
                Completion Rate
              </div>
            </div>
          </div>

          {/* View All Button */}
          <Link
            href={`/players/${playerId}/achievements`}
            className="block w-full py-3 px-4 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 hover:from-cyan-500/20 hover:to-blue-600/20 border border-cyan-400/30 hover:border-cyan-400/50 rounded-lg text-center text-[10px] font-black uppercase tracking-[3px] text-cyan-400 transition-all relative z-10 group"
          >
            <span className="group-hover:tracking-[4px] transition-all">View All Achievements →</span>
          </Link>
        </div>
      ) : (
        <div className="glass-panel p-8 rounded-2xl text-center">
          <div className="text-4xl mb-3 opacity-20">🏆</div>
          <div className="text-sm text-white/40 uppercase tracking-widest font-bold">
            No badges earned yet
          </div>
          <div className="text-xs text-white/30 mt-2">
            Play tournaments to unlock achievements
          </div>
        </div>
      )}

      {/* Next Milestones */}
      <div className="glass-panel p-5 rounded-2xl border-t border-cyan-400/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[40px] rounded-full pointer-events-none"></div>
        
        <h4 className="text-[10px] font-black text-white/60 tracking-[3px] uppercase mb-4 relative z-10">
          Next Milestones
        </h4>
        
        <div className="space-y-3 relative z-10">
          {getClosestBadges(badges, 3).map(badge => {
            const colors = TIER_COLORS[badge.tier] || TIER_COLORS.bronze
            const progress = badge.progress || 0
            
            return (
              <div 
                key={badge.key}
                className="flex items-center gap-3 p-3 rounded-lg bg-black/40 border border-white/5 hover:border-white/10 transition-all"
              >
                {/* Badge Icon */}
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl border flex-shrink-0"
                  style={{
                    backgroundColor: colors.bg,
                    borderColor: colors.border,
                    filter: 'grayscale(80%)',
                    opacity: 0.6
                  }}
                >
                  {badge.icon}
                </div>
                
                {/* Badge Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div 
                      className="text-[10px] font-black uppercase tracking-wider"
                      style={{ color: colors.color }}
                    >
                      {badge.name}
                    </div>
                    <div className="text-[9px] font-bold text-white/40 ml-2 flex-shrink-0">
                      {progress}%
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div className="text-[8px] text-white/40 mb-2 line-clamp-1">
                    {badge.desc}
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-1.5 bg-black/60 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${progress}%`,
                        backgroundColor: colors.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
          
          {getClosestBadges(badges, 3).length === 0 && (
            <div className="text-center py-4 text-white/30 text-xs">
              All milestones achieved! 🎉
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Get the closest unearned badges (highest progress)
function getClosestBadges(badges: Badge[], count: number): Badge[] {
  return badges
    .filter(b => !b.earned && b.progress !== undefined && b.progress > 0)
    .sort((a, b) => (b.progress || 0) - (a.progress || 0))
    .slice(0, count)
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