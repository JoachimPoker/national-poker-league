'use client'
import { Badge, TIER_COLORS } from '@/lib/badge-definitions'

export default function BadgeGrid({ badges }: { badges: Badge[] }) {
  const categories = [...new Set(badges.map(b => b.category))]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {categories.map(cat => (
        <div key={cat}>
          <div style={{
            fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)',
            letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px',
          }}>
            {cat}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
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
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '8px', width: '88px', opacity: dim ? 0.35 : 1,
        cursor: 'default',
      }}
      title={badge.earned ? badge.desc : `${badge.desc} — not yet earned`}
    >
      {/* Hexagon shape */}
      <div style={{
        width: '60px', height: '68px', position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        background: dim ? 'rgba(255,255,255,0.05)' : colors.bg,
      }}>
        <span style={{
          fontSize: badge.icon.length > 1 ? '20px' : '24px',
          filter: dim ? 'grayscale(1)' : 'none',
        }}>
          {badge.icon}
        </span>

        {/* Earned indicator dot */}
        {badge.earned && (
          <div style={{
            position: 'absolute', bottom: '10px', right: '14px',
            width: '8px', height: '8px', borderRadius: '50%',
            background: colors.color,
          }} />
        )}
      </div>

      {/* Badge name */}
      <div style={{
        fontSize: '10px', fontWeight: 700, textAlign: 'center', lineHeight: 1.3,
        color: badge.earned ? colors.color : 'rgba(255,255,255,0.25)',
      }}>
        {badge.name}
      </div>

      {/* Tier label */}
      <div style={{
        fontSize: '9px', textAlign: 'center', letterSpacing: '1px',
        textTransform: 'uppercase',
        color: badge.earned ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)',
      }}>
        {badge.tier}
      </div>

      {/* Progress bar for unearned tiered badges */}
      {!badge.earned && badge.progress !== undefined && (
        <div style={{ width: '100%' }}>
          <div style={{
            height: '3px', background: 'rgba(255,255,255,0.08)',
            borderRadius: '2px', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${badge.progress}%`,
              background: colors.color, borderRadius: '2px', opacity: 0.6,
            }} />
          </div>
          <div style={{
            fontSize: '9px', color: 'rgba(255,255,255,0.2)',
            textAlign: 'center', marginTop: '3px',
          }}>
            {badge.progressLabel}
          </div>
        </div>
      )}
    </div>
  )
}

// Compact chip badges for leaderboard rows
export function BadgeChips({ badges }: { badges: Badge[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
      {badges.map(badge => {
        const colors = TIER_COLORS[badge.tier]
        return (
          <div
            key={badge.key}
            title={badge.name}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '4px 9px', borderRadius: '4px',
              background: colors.bg, border: `1px solid ${colors.border}`,
            }}
          >
            <span style={{ fontSize: '12px' }}>{badge.icon}</span>
            <span style={{
              fontSize: '10px', fontWeight: 700,
              color: colors.color, letterSpacing: '0.3px',
            }}>
              {badge.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}