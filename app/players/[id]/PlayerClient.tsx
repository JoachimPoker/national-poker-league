'use client'
import { useState } from 'react'
import Link from 'next/link'
import BadgeGrid from '@/components/BadgeComponents'
import type { Badge } from '@/lib/badge-definitions'

interface Season {
  id: number
  name: string
  year: number
  is_active: boolean
}

interface SeasonStat {
  season: Season
  events: number
  wins: number
  cashes: number
  money: number
  points: number
  results: any[]
}

interface PlayerClientProps {
  player: any
  allResults: any[]
  seasonStats: SeasonStat[]
  badges: Badge[]
  careerRank: number
  lifetimeWins: number
  lifetimeCashes: number
  lifetimeEventsPlayed: number
  lifetimePrizeMoney: number
  lifetimeFinalTables: number
  winRate: string
  bestFinish: number
  biggestCash: number
  favoriteVenue: string | null
}

export default function PlayerClient({
  player,
  allResults,
  seasonStats,
  badges,
  careerRank,
  lifetimeWins,
  lifetimeCashes,
  lifetimeEventsPlayed,
  lifetimePrizeMoney,
  lifetimeFinalTables,
  winRate,
  bestFinish,
  biggestCash,
  favoriteVenue
}: PlayerClientProps) {
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null)

  // Filter results by selected season
  const filteredResults = selectedSeasonId
    ? allResults.filter(r => r.season_id === selectedSeasonId)
    : allResults

  const currentSeason = seasonStats.find(s => s.season.is_active)?.season

  return (
    <>
      {/* HERO HEADER */}
      <section className="relative bg-black/40 border-b border-white/10 pt-10 pb-12 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          
          <Link href="/players" className="group inline-flex items-center gap-2 text-[10px] text-white/40 hover:text-cyan-400 font-bold uppercase tracking-widest mb-8 transition-colors">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Directory
          </Link>

          <div className="flex flex-col md:flex-row md:items-center gap-6 lg:gap-10">
            
            {/* Avatar */}
            <div className="relative">
              {careerRank === 1 && <div className="absolute inset-0 bg-[#D4AF37] blur-[20px] rounded-full opacity-40 animate-pulse"></div>}
              <div className={`relative w-24 h-24 md:w-28 md:h-28 rounded-full flex-shrink-0 flex items-center justify-center text-3xl font-black border-4 shadow-xl z-10 ${
                careerRank === 1
                  ? 'bg-gradient-to-br from-[#D4AF37]/30 to-[#FBF091]/10 text-[#FBF091] border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.4)]' 
                  : 'bg-gradient-to-br from-cyan-500/20 to-blue-600/10 text-cyan-400 border-cyan-400/50 shadow-[0_0_30px_rgba(0,243,255,0.2)]'
              }`}>
                {player.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </div>
            </div>

            {/* Player Details */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <span className="h-[2px] w-6 bg-gradient-to-r from-transparent to-cyan-400"></span>
                <span className="text-cyan-400 text-[10px] tracking-[4px] uppercase font-black">
                  Career Profile
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-black italic tracking-tighter uppercase mb-2 drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] leading-none">
                {player.full_name}
              </h1>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="text-white/50 text-sm md:text-base font-mono uppercase tracking-widest">
                  {player.home_casino || 'Independent'}
                </div>
                {favoriteVenue && favoriteVenue !== player.home_casino && (
                  <div className="text-xs text-white/30 font-mono">
                    Most Active: {favoriteVenue}
                  </div>
                )}
              </div>
            </div>

            {/* Career Rank Badge */}
            {careerRank > 0 && (
              <div className="text-left md:text-center flex-shrink-0 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
                {careerRank === 1 && <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/20 blur-[30px] rounded-full"></div>}
                <div className="text-[10px] text-white/50 uppercase tracking-[3px] font-black mb-1 relative z-10">
                  All-Time Rank
                </div>
                <div className={`text-5xl md:text-6xl font-black italic relative z-10 ${careerRank === 1 ? 'text-gold-gradient drop-shadow-md' : 'text-white'}`}>
                  #{careerRank}
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 md:px-12 py-12">
        
        {/* CAREER HIGHLIGHTS */}
        <div className="mb-12">
          <h2 className="text-[11px] font-black text-white/60 tracking-[4px] uppercase mb-6 border-b border-white/10 pb-4">
            Career Highlights
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: 'Tournaments', value: lifetimeEventsPlayed, icon: '🎯', color: 'text-white' },
              { label: 'Wins', value: lifetimeWins, icon: '🏆', color: 'text-gold-gradient' },
              { label: 'Final Tables', value: lifetimeFinalTables, icon: '🎖️', color: 'text-purple-400' },
              { label: 'Win Rate', value: `${winRate}%`, icon: '📊', color: 'text-cyan-400' },
              { label: 'Best Finish', value: bestFinish > 0 ? `${bestFinish}${ordinal(bestFinish)}` : '—', icon: '⭐', color: bestFinish === 1 ? 'text-gold-gradient' : 'text-white' },
            ].map((stat) => (
              <div key={stat.label} className="glass-panel rounded-2xl p-5 relative overflow-hidden group hover:border-white/20 transition-all">
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-colors"></div>
                <div className="text-2xl mb-2 relative z-10">{stat.icon}</div>
                <div className="text-[9px] text-white/40 tracking-[2px] uppercase font-black mb-2 relative z-10">
                  {stat.label}
                </div>
                <div className={`text-2xl font-black relative z-10 ${stat.color}`}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CAREER EARNINGS */}
        <div className="mb-12">
          <h2 className="text-[11px] font-black text-white/60 tracking-[4px] uppercase mb-6 border-b border-white/10 pb-4">
            Career Earnings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-2xl border-t border-emerald-400/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full"></div>
              <div className="text-[10px] text-white/40 uppercase tracking-[3px] font-black mb-3 relative z-10">
                Total Prize Money
              </div>
              <div className="text-4xl font-black text-emerald-400 relative z-10 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                £{lifetimePrizeMoney.toLocaleString()}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
              <div className="text-[10px] text-white/40 uppercase tracking-[3px] font-black mb-3">
                Biggest Cash
              </div>
              <div className="text-3xl font-black text-white">
                £{biggestCash.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* TROPHY CABINET - Full Width */}
        <div className="mb-12">
          <div className="glass-panel p-6 rounded-3xl border-t border-t-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[40px] rounded-full pointer-events-none"></div>
            <h3 className="text-[11px] font-black text-white/60 tracking-[4px] uppercase mb-6 border-b border-white/10 pb-3 relative z-10">
              Trophy Cabinet
            </h3>
            <div className="relative z-10">
              <BadgeGrid badges={badges} />
            </div>
          </div>
        </div>

        {/* SEASON BREAKDOWN - Clickable */}
        <div className="mb-12">
          <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-4">
            <h2 className="text-[11px] font-black text-white/60 tracking-[4px] uppercase">
              Season History
            </h2>
            {selectedSeasonId && (
              <button
                onClick={() => setSelectedSeasonId(null)}
                className="text-[9px] text-cyan-400 hover:text-cyan-300 uppercase tracking-widest font-bold transition-colors"
              >
                ← Show All Seasons
              </button>
            )}
          </div>
          <div className="glass-panel rounded-3xl overflow-hidden">
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-[1fr_100px_80px_120px_100px] gap-4 p-5 border-b border-white/10 bg-white/5 text-[9px] uppercase tracking-[3px] font-black text-white/40">
              <div>Season</div>
              <div className="text-right">Events</div>
              <div className="text-right">Wins</div>
              <div className="text-right">Prize Money</div>
              <div className="text-right pr-2">NPL Points</div>
            </div>

            {/* Body - Clickable Rows */}
            <div className="bg-black/50 backdrop-blur-xl">
              {seasonStats.map((stat) => {
                const isCurrentSeason = stat.season.is_active
                const isSelected = selectedSeasonId === stat.season.id
                return (
                  <button
                    key={stat.season.id}
                    onClick={() => setSelectedSeasonId(stat.season.id)}
                    className={`w-full group flex flex-col md:grid md:grid-cols-[1fr_100px_80px_120px_100px] gap-4 p-5 md:items-center border-b border-white/5 last:border-0 hover:bg-gradient-to-r hover:from-cyan-400/10 hover:to-transparent transition-all relative cursor-pointer text-left ${
                      isSelected ? 'bg-cyan-400/10' : isCurrentSeason ? 'bg-cyan-400/5' : ''
                    }`}
                  >
                    {/* Glow for selected/current */}
                    {(isSelected || isCurrentSeason) && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-blue-600"></div>}

                    {/* Season Name */}
                    <div className="pl-2 md:pl-0">
                      <div className="text-sm font-bold text-white/90 flex items-center gap-2">
                        {stat.season.name}
                        {isCurrentSeason && <span className="text-[8px] uppercase tracking-widest font-black text-cyan-400 bg-cyan-400/10 border border-cyan-400/30 px-1.5 py-0.5 rounded">Current</span>}
                        {isSelected && <span className="text-[8px] uppercase tracking-widest font-black text-cyan-400">→</span>}
                      </div>
                    </div>

                    <div className="flex justify-between md:justify-end pl-2 md:pl-0">
                      <span className="md:hidden text-[10px] text-white/40 uppercase tracking-widest font-bold">Events</span>
                      <span className="text-sm text-white/80 font-mono">{stat.events}</span>
                    </div>

                    <div className="flex justify-between md:justify-end pl-2 md:pl-0">
                      <span className="md:hidden text-[10px] text-white/40 uppercase tracking-widest font-bold">Wins</span>
                      <span className={`text-sm font-black ${stat.wins > 0 ? 'text-gold-gradient' : 'text-white/60'}`}>{stat.wins}</span>
                    </div>

                    <div className="flex justify-between md:justify-end pl-2 md:pl-0">
                      <span className="md:hidden text-[10px] text-white/40 uppercase tracking-widest font-bold">Prize Money</span>
                      <span className="text-sm text-emerald-400 font-mono">£{stat.money.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between md:justify-end pl-2 md:pl-0 md:pr-2">
                      <span className="md:hidden text-[10px] text-white/40 uppercase tracking-widest font-bold">Points</span>
                      <span className="text-sm font-black text-cyan-400 font-mono">{stat.points.toFixed(2)}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* TOURNAMENT HISTORY - Filtered */}
        <div>
          <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-4">
            <h3 className="text-[11px] font-black text-white/60 tracking-[4px] uppercase">
              {selectedSeasonId 
                ? `${seasonStats.find(s => s.season.id === selectedSeasonId)?.season.name} Tournament History`
                : 'Complete Tournament History'
              }
            </h3>
            <span className="text-[10px] uppercase tracking-widest font-bold text-white/30">
              {filteredResults.length} Records
            </span>
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-[1fr_100px_80px_90px_90px] gap-4 p-5 border-b border-white/10 bg-white/5 text-[9px] uppercase tracking-[3px] font-black text-white/40">
              <div>Event</div>
              <div className="text-right">Date</div>
              <div className="text-right">Finish</div>
              <div className="text-right">Buy-in</div>
              <div className="text-right pr-2">Prize</div>
            </div>

            {/* Body */}
            <div className="bg-black/50 backdrop-blur-xl max-h-[600px] overflow-y-auto">
              {filteredResults.length === 0 ? (
                <div className="p-12 text-center text-white/30 font-bold uppercase tracking-widest text-sm">
                  No recorded results yet
                </div>
              ) : (
                filteredResults.map((result) => {
                  const isWin = result.finish_position === 1
                  return (
                    <div key={result.id} className="group flex flex-col md:grid md:grid-cols-[1fr_100px_80px_90px_90px] gap-4 p-5 md:items-center border-b border-white/5 last:border-0 hover:bg-gradient-to-r hover:from-white/5 hover:to-transparent transition-all relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b from-cyan-400 to-blue-600"></div>
                      {isWin && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#D4AF37] to-[#FBF091] shadow-[0_0_10px_rgba(212,175,55,0.5)]"></div>}

                      <div className="pl-2 md:pl-0">
                        <Link href={`/events/${result.event_id}`} className="text-[13px] font-bold text-white/90 group-hover:text-cyan-400 transition-colors leading-snug block mb-1.5 pr-2">
                          {result.events?.tournament_name}
                        </Link>
                        <div className="flex items-center gap-2">
                          {result.events?.is_high_roller && <span className="text-[8px] uppercase tracking-widest font-black text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 rounded">HR</span>}
                          {result.events?.is_low_roller && <span className="text-[8px] uppercase tracking-widest font-black text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-1.5 py-0.5 rounded">LR</span>}
                          <span className="text-[9px] text-white/40 font-mono tracking-tight">{result.events?.casino}</span>
                        </div>
                      </div>

                      <div className="hidden md:block text-[10px] text-white/40 text-right font-mono">
                        {result.events?.start_date ? new Date(result.events.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                      </div>

                      <div className="flex justify-between items-center md:justify-end pl-2 md:pl-0">
                        <span className="md:hidden text-[10px] text-white/40 uppercase tracking-widest font-bold">Finish</span>
                        <span className={`font-black italic ${isWin ? 'text-2xl text-gold-gradient drop-shadow-sm' : 'text-lg text-white/80'}`}>
                          {result.finish_position}<span className="text-xs">{ordinal(result.finish_position)}</span>
                        </span>
                      </div>

                      <div className="flex justify-between items-center md:justify-end pl-2 md:pl-0">
                        <span className="md:hidden text-[10px] text-white/40 uppercase tracking-widest font-bold">Buy-in</span>
                        <span className="text-xs text-white/60 font-mono">
                          £{Number(result.events?.buy_in || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center md:justify-end pl-2 md:pl-0 md:pr-2">
                        <span className="md:hidden text-[10px] text-white/40 uppercase tracking-widest font-bold">Prize</span>
                        <span className={`font-mono font-black ${result.prize_amount > 0 ? 'text-emerald-400' : 'text-white/30'}`}>
                          {result.prize_amount > 0 ? `£${result.prize_amount.toLocaleString()}` : '—'}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

      </main>
    </>
  )
}

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}