'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'

const LEAGUES = [
  { key: 'npl', label: 'NPL Main', activeClass: 'lb-tab-active-npl', color: 'from-blue-600 to-cyan-400' },
  { key: 'hr',  label: 'High Roller', activeClass: 'lb-tab-active-hr', color: 'from-amber-500 to-yellow-300' },
  { key: 'lr',  label: 'Low Roller', activeClass: 'lb-tab-active-lr', color: 'from-green-600 to-emerald-400' },
]

const ITEMS_PER_PAGE = 20

export default function LeaderboardClient({ npl, hr, lr }: { npl: any[], hr: any[], lr: any[] }) {
  const [active, setActive] = useState('npl')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // 1. Get raw data and attach TRUE absolute rank
  const rawData = useMemo(() => {
    const data = active === 'npl' ? npl : active === 'hr' ? hr : lr
    return data.map((entry, idx) => ({ ...entry, absoluteRank: idx + 1 }))
  }, [active, npl, hr, lr])

  // 2. Filter by search
  const isSearching = search.trim() !== ''
  const filteredData = useMemo(() => {
    if (!isSearching) return rawData
    return rawData.filter(e => e.gdpr && e.full_name?.toLowerCase().includes(search.toLowerCase()))
  }, [rawData, search, isSearching])

  // 3. Calculate Pagination
  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE))
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredData.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredData, currentPage])

  // 4. Handlers to reset page
  const handleTabChange = (key: string) => {
    setActive(key)
    setSearch('')
    setCurrentPage(1)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  const activeGradient = LEAGUES.find(l => l.key === active)?.color || 'from-gray-500 to-gray-400'
  
  // Only show the giant "Top 3" cards if we are on Page 1 and not searching
  const showTopThreeCards = !isSearching && currentPage === 1 && paginatedData.length >= 3
  const topThree = showTopThreeCards ? paginatedData.slice(0, 3) : []
  const theRest = showTopThreeCards ? paginatedData.slice(3) : paginatedData

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <div className="lb-tab-bar !mb-0 p-1.5 bg-black/40 rounded-[16px] border border-white/5 backdrop-blur-md w-full md:w-auto overflow-x-auto">
          {LEAGUES.map(tab => (
            <button
              key={tab.key}
              className={`lb-tab border-0 whitespace-nowrap ${active === tab.key ? tab.activeClass : 'bg-transparent text-white/40'}`}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <input
          className="lb-search !mb-0 w-full md:max-w-md bg-black/40 border-white/10 focus:border-cyan-400"
          placeholder="Search contenders..."
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      {filteredData.length === 0 ? (
        <div className="glass-panel p-16 text-center text-white/40 font-bold uppercase tracking-widest text-sm rounded-3xl mb-12 border-dashed border-2 border-white/10">
          No records found in the vault.
        </div>
      ) : (
        <>
          {/* Top 3 Power Cards (Only on Page 1) */}
          {showTopThreeCards && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">
              {topThree.map((entry) => {
                const isFirst = entry.absoluteRank === 1
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
                      {isFirst && (
                        <div className="absolute top-[-50%] right-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.15)_0%,transparent_50%)] animate-pulse pointer-events-none" />
                      )}
                      
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                          <span className={`font-black italic drop-shadow-lg ${isFirst ? 'text-7xl text-gold-gradient' : 'text-5xl text-white/20'}`}>
                            0{entry.absoluteRank}
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
                        
                        <div className="flex gap-2 mb-8 mt-2">
                           <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-[9px] uppercase tracking-widest font-bold text-white/60">
                             {entry.result_count} Events
                           </span>
                        </div>
                      </div>

                      <div className="relative z-10">
                        <div className={`font-black font-mono tracking-tight ${isFirst ? 'text-5xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'text-3xl text-white/90'}`}>
                          {entry.total_points.toFixed(2)} <span className="text-sm text-white/30 font-sans tracking-widest uppercase">PTS</span>
                        </div>
                        <div className="h-[4px] w-full bg-black mt-5 relative overflow-hidden rounded-full shadow-inner">
                          <div className={`absolute inset-0 bg-gradient-to-r ${isFirst ? 'from-[#D4AF37] via-[#FBF091] to-[#D4AF37] animate-shine' : activeGradient}`} style={{ width: isFirst ? '100%' : entry.absoluteRank === 2 ? '80%' : '65%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Paginated List (The Rest) */}
          {theRest.length > 0 && (
            <div className="glass-panel rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t border-white/10 mb-8">
              
              {/* Desktop Table Header */}
              <div className="hidden md:grid grid-cols-[80px_1fr_120px_120px] gap-4 p-6 border-b border-white/10 bg-white/5 text-[10px] uppercase tracking-[3px] font-black text-white/40">
                <div className="text-center">Rank</div>
                <div>Player</div>
                <div className="text-center">Events</div>
                <div className="text-right pr-4">Points</div>
              </div>
              
              <div className="bg-black/50 backdrop-blur-xl">
                {theRest.map((entry) => {
                  const isTopThree = entry.absoluteRank <= 3;
                  
                  return (
                    <div 
                      key={entry.player_id} 
                      className={`group flex flex-col md:grid md:grid-cols-[80px_1fr_120px_120px] gap-4 p-5 md:items-center border-b border-white/5 last:border-0 hover:bg-gradient-to-r hover:from-white/5 hover:to-transparent transition-all relative`}
                    >
                      {/* Hover Glow Edge */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${isTopThree ? 'from-[#D4AF37] to-[#FBF091]' : activeGradient} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                      
                      {/* Rank */}
                      <div className="flex items-center md:justify-center pl-2 md:pl-0 mb-2 md:mb-0">
                        <span className={`font-black italic transition-all ${
                          isTopThree ? 'text-white/80 text-4xl md:text-3xl' : 'text-white/20 group-hover:text-white/50 text-2xl'
                        }`}>
                          {String(entry.absoluteRank).padStart(2, '0')}
                        </span>
                      </div>
                      
                      {/* Player Name */}
                      <div className="pl-2 md:pl-0 flex items-center">
                        {entry.gdpr ? (
                          <Link href={`/players/${entry.player_id}`} className={`font-black tracking-tight hover:text-cyan-400 transition-colors ${
                            isTopThree ? 'text-2xl md:text-xl text-white drop-shadow-md' : 'text-[15px] text-white/80 group-hover:text-white'
                          }`}>
                            {entry.full_name}
                          </Link>
                        ) : (
                          <span className={`font-bold italic ${isTopThree ? 'text-lg text-white/60' : 'text-[15px] text-white/40'}`}>
                            Anonymous Player
                          </span>
                        )}
                      </div>
                      
                      {/* Events */}
                      <div className="hidden md:flex justify-center">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                          {entry.result_count} Events
                        </span>
                      </div>
                      
                      {/* Points & Mobile Events Data */}
                      <div className="flex justify-between items-center md:justify-end w-full md:pr-4 pl-2 md:pl-0 mt-2 md:mt-0">
                        <span className="md:hidden text-[10px] text-white/40 uppercase tracking-widest font-bold">
                          {entry.result_count} Events
                        </span>
                        <span className={`font-mono font-black ${
                          isTopThree ? 'text-2xl md:text-xl text-white bg-white/10 px-4 py-1.5 rounded-xl border border-white/10' : 
                          'text-xl md:text-lg text-white bg-black/40 px-4 py-1.5 rounded-lg border border-white/5 group-hover:border-white/20 transition-colors'
                        }`}>
                          {entry.total_points.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-6 mt-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white/10 hover:border-cyan-400/50 disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:border-white/10 transition-all"
              >
                &lt; Prev
              </button>
              
              <div className="text-[10px] font-black uppercase tracking-widest text-white/50">
                Page <span className="text-white mx-1">{currentPage}</span> of <span className="text-white/80 mx-1">{totalPages}</span>
              </div>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white/10 hover:border-cyan-400/50 disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:border-white/10 transition-all"
              >
                Next &gt;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}