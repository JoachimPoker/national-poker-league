'use client'
import { useState } from 'react'
import Link from 'next/link'

const LEAGUES = [
  { key: 'npl', label: 'NPL Main', activeClass: 'lb-tab-active-npl', color: 'from-blue-600 to-cyan-400' },
  { key: 'hr',  label: 'High Roller', activeClass: 'lb-tab-active-hr', color: 'from-amber-500 to-yellow-300' },
  { key: 'lr',  label: 'Low Roller', activeClass: 'lb-tab-active-lr', color: 'from-green-600 to-emerald-400' },
]

export default function HomeLeaderboard({ npl, hr, lr }: { npl: any[], hr: any[], lr: any[] }) {
  const [active, setActive] = useState('npl')
  const [search, setSearch] = useState('')

  const rawData = active === 'npl' ? npl : active === 'hr' ? hr : lr
  const data = search.trim()
    ? rawData.filter(e => e.gdpr && e.full_name?.toLowerCase().includes(search.toLowerCase()))
    : rawData

  const topThree = data.slice(0, 3)
  const theRest = data.slice(3)
  const activeGradient = LEAGUES.find(l => l.key === active)?.color || 'from-gray-500 to-gray-400'

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="lb-tab-bar !mb-0 p-1.5 bg-black/40 rounded-[16px] border border-white/5 backdrop-blur-md">
          {LEAGUES.map(tab => (
            <button
              key={tab.key}
              className={`lb-tab border-0 ${active === tab.key ? tab.activeClass : 'bg-transparent'}`}
              onClick={() => { setActive(tab.key); setSearch('') }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <input
          className="lb-search !mb-0 max-w-xs"
          placeholder="Search contenders…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {data.length === 0 ? (
        <div className="glass-panel p-16 text-center text-white/40 font-bold uppercase tracking-widest text-sm rounded-3xl mb-12 border-dashed border-2 border-white/10">
          No records found in the vault.
        </div>
      ) : (
        <>
          {/* Top 3 Power Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">
            {topThree.map((entry, idx) => {
              const rank = idx + 1;
              const isFirst = rank === 1;
              
              return (
                <div 
                  key={entry.player_id} 
                  className={`relative group rounded-[28px] transition-all duration-500 ${
                    isFirst 
                      ? 'p-[2px] bg-gradient-to-b from-[#D4AF37] via-[#FBF091] to-transparent lg:-translate-y-4 shadow-[0_20px_50px_rgba(212,175,55,0.2)] hover:shadow-[0_20px_60px_rgba(212,175,55,0.35)]' 
                      : 'p-[1px] bg-white/10 hover:bg-white/20 hover:-translate-y-2'
                  }`}
                >
                  <div className={`bg-[#0A0A10] rounded-[26px] flex flex-col justify-between relative overflow-hidden h-full ${
                    isFirst ? 'p-10 min-h-[300px]' : 'p-8 min-h-[260px]'
                  }`}>
                    {/* Glowing Core for #1 */}
                    {isFirst && (
                      <div className="absolute top-[-50%] right-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.15)_0%,transparent_50%)] animate-pulse pointer-events-none" />
                    )}
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <span className={`font-black italic drop-shadow-lg ${isFirst ? 'text-7xl text-gold-gradient' : 'text-5xl text-white/20'}`}>
                          0{rank}
                        </span>
                        {isFirst && (
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B6914] flex items-center justify-center text-xl shadow-[0_0_20px_rgba(212,175,55,0.6)] border-2 border-[#FBF091]">
                            👑
                          </div>
                        )}
                      </div>
                      
                      {entry.gdpr ? (
                        <Link href={`/players/${entry.player_id}`} className="block">
                          <h4 className={`${isFirst ? 'text-3xl' : 'text-xl'} font-black mb-2 text-white group-hover:text-cyan-400 transition-colors drop-shadow-md`}>{entry.full_name}</h4>
                        </Link>
                      ) : (
                        <h4 className={`${isFirst ? 'text-3xl' : 'text-xl'} font-black mb-2 text-white/40 italic`}>Anonymous</h4>
                      )}
                      
                      {/* Vibrant Badges */}
                      <div className="flex gap-2 mb-8 mt-2">
                         <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-[9px] uppercase tracking-widest font-bold text-white/60">
                           {entry.result_count} Events
                         </span>
                         {isFirst && (
                           <span className="px-3 py-1 rounded-md bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[9px] uppercase tracking-widest font-bold text-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                             Leader
                           </span>
                         )}
                      </div>
                    </div>

                    <div className="relative z-10">
                      <div className={`font-black font-mono tracking-tight ${isFirst ? 'text-5xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'text-3xl text-white/90'}`}>
                        {entry.total_points.toFixed(2)} <span className="text-sm text-white/30 font-sans tracking-widest uppercase">PTS</span>
                      </div>
                      
                      {/* Neon Progress Bar */}
                      <div className="h-[4px] w-full bg-black mt-5 relative overflow-hidden rounded-full shadow-inner">
                        <div className={`absolute inset-0 bg-gradient-to-r ${isFirst ? 'from-[#D4AF37] via-[#FBF091] to-[#D4AF37] animate-shine' : activeGradient}`} style={{ width: isFirst ? '100%' : rank === 2 ? '80%' : '65%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* The Rest of the Pack */}
          {theRest.length > 0 && (
            <div className="glass-panel rounded-3xl overflow-hidden mb-12 border-t border-t-white/10 shadow-2xl">
              <div className="bg-black/50 backdrop-blur-xl">
                {theRest.map((entry, idx) => (
                  <div key={entry.player_id} className="group flex items-center justify-between p-5 border-b border-white/5 last:border-0 hover:bg-gradient-to-r hover:from-white/5 hover:to-transparent transition-all relative">
                    {/* Hover Glow Edge */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${activeGradient} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                    
                    <div className="flex items-center gap-6 pl-2">
                      <span className="text-white/20 font-black italic text-xl w-8 text-right group-hover:text-white/50 transition-colors">
                        {String(idx + 4).padStart(2, '0')}
                      </span>
                      {entry.gdpr ? (
                        <Link href={`/players/${entry.player_id}`} className="font-bold text-[15px] text-white/80 group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">
                          {entry.full_name}
                        </Link>
                      ) : (
                        <span className="font-bold text-[15px] text-white/40 italic">Anonymous Player</span>
                      )}
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold hidden md:inline-block">{entry.result_count} Events</span>
                      <span className="font-mono font-bold text-white text-lg bg-black/40 px-4 py-1.5 rounded-lg border border-white/5 group-hover:border-white/20 transition-colors">
                        {entry.total_points.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}