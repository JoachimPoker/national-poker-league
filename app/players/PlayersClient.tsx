'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'

const PAGE_SIZE = 50

export default function PlayersClient({ players, venues }: { players: any[], venues: string[] }) {
  const [search, setSearch] = useState('')
  const [venue, setVenue] = useState('')
  const [sortBy, setSortBy] = useState('points')
  const [page, setPage] = useState(1)
  const [view, setView] = useState<'list' | 'grid'>('list')

  const filtered = useMemo(() => {
    let result = [...players]

    if (search.trim()) {
      const q = search.toLowerCase().trim()
      result = result.filter(p => {
        const name = p.gdpr ? p.full_name.toLowerCase() : 'anonymous player'
        return name.includes(q)
      })
    }

    if (venue) {
      result = result.filter(p => p.gdpr && p.home_casino === venue)
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'points') return b.total_points - a.total_points
      if (sortBy === 'results') return b.result_count - a.result_count
      if (sortBy === 'prize') return b.total_prize_money - a.total_prize_money
      if (sortBy === 'name') {
        const nameA = a.gdpr ? a.full_name : 'Anonymous'
        const nameB = b.gdpr ? b.full_name : 'Anonymous'
        return nameA.localeCompare(nameB)
      }
      return 0
    })

    return result
  }, [players, search, venue, sortBy])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleFilterChange(setter: (v: any) => void, value: any) {
    setter(value)
    setPage(1)
  }

  const nplRankMap = useMemo(() => {
    const map = new Map<number, number>()
    players.forEach((p, i) => map.set(p.player_id, i + 1))
    return map
  }, [players])

  return (
    <div className="w-full">
      {/* NEON CONTROLS PANEL */}
      <div className="glass-panel p-6 rounded-3xl mb-8 flex flex-col lg:flex-row gap-6 lg:items-end">
        
        {/* Search */}
        <div className="flex-1">
          <label className="block text-[10px] text-white/50 tracking-[3px] uppercase font-black mb-3 ml-1">Scout Player</label>
          <input
            type="text"
            value={search}
            onChange={e => handleFilterChange(setSearch, e.target.value)}
            placeholder="Enter player name..."
            className="w-full bg-black/50 border border-white/10 text-white px-5 py-3 rounded-xl focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all font-medium"
          />
        </div>

        {/* Venue Filter */}
        <div className="lg:w-64">
          <label className="block text-[10px] text-white/50 tracking-[3px] uppercase font-black mb-3 ml-1">Home Venue</label>
          <select
            value={venue}
            onChange={e => handleFilterChange(setVenue, e.target.value)}
            className="w-full bg-black/50 border border-white/10 text-white px-5 py-3 rounded-xl focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all font-medium appearance-none cursor-pointer"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'rgba(255,255,255,0.5)\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
          >
            <option value="" className="bg-[#040408]">All Venues</option>
            {venues.map(v => <option key={v} value={v} className="bg-[#040408]">{v}</option>)}
          </select>
        </div>

        {/* Sort */}
        <div className="lg:w-56">
          <label className="block text-[10px] text-white/50 tracking-[3px] uppercase font-black mb-3 ml-1">Sort Index By</label>
          <select
            value={sortBy}
            onChange={e => handleFilterChange(setSortBy, e.target.value)}
            className="w-full bg-black/50 border border-white/10 text-white px-5 py-3 rounded-xl focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all font-medium appearance-none cursor-pointer"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'rgba(255,255,255,0.5)\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
          >
            <option value="points" className="bg-[#040408]">NPL Points</option>
            <option value="results" className="bg-[#040408]">Most Results</option>
            <option value="prize" className="bg-[#040408]">Prize Money</option>
            <option value="name" className="bg-[#040408]">Name (A–Z)</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 h-[48px]">
          <button
            onClick={() => setView('list')}
            className={`w-12 rounded-xl flex items-center justify-center transition-all ${view === 'list' ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(0,243,255,0.2)]' : 'bg-black/50 border border-white/10 text-white/40 hover:text-white'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          <button
            onClick={() => setView('grid')}
            className={`w-12 rounded-xl flex items-center justify-center transition-all ${view === 'grid' ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(0,243,255,0.2)]' : 'bg-black/50 border border-white/10 text-white/40 hover:text-white'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
          </button>
        </div>
      </div>

      {/* Meta Bar */}
      <div className="flex justify-between items-center mb-6 px-2">
        <div className="text-[10px] text-white/50 tracking-[3px] uppercase font-black">
          {filtered.length === players.length
            ? `Displaying all ${players.length} contenders`
            : `Found ${filtered.length} of ${players.length} contenders`}
        </div>
        {(search || venue) && (
          <button
            onClick={() => { setSearch(''); setVenue(''); setPage(1) }}
            className="text-[10px] text-red-400 hover:text-red-300 tracking-[2px] uppercase font-black transition-colors"
          >
            Clear Filters ×
          </button>
        )}
      </div>

      {/* --- LIST VIEW --- */}
      {view === 'list' && (
        <div className="glass-panel rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t border-t-white/10">
          {/* Header */}
          <div className="hidden md:grid grid-cols-[80px_1fr_100px_120px_140px] gap-4 p-6 border-b border-white/10 bg-white/5 text-[9px] uppercase tracking-[3px] font-black text-white/40">
            <div className="text-center">Rank</div>
            <div>Contender</div>
            <div className="text-center">Results</div>
            <div className="text-right">Points</div>
            <div className="text-right pr-4">Earnings</div>
          </div>

          <div className="bg-black/50 backdrop-blur-xl">
            {paginated.length === 0 ? (
              <div className="p-16 text-center text-white/30 font-bold uppercase tracking-widest text-sm">No players found</div>
            ) : (
              paginated.map((player) => {
                const rank = nplRankMap.get(player.player_id) || 0
                const isFirst = rank === 1
                const isTopTen = rank <= 10
                const isAnonymous = !player.gdpr

                const displayName = isAnonymous ? 'Anonymous Player' : player.full_name
                const displayLocation = isAnonymous ? 'Location Hidden' : (player.home_casino || 'Location Unknown')
                const initials = isAnonymous ? '?' : player.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)

                const rowContent = (
                  <>
                    {/* Hover Glow Edge */}
                    {!isAnonymous && <div className={`absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b ${isFirst ? 'from-[#D4AF37] to-[#FBF091]' : 'from-cyan-400 to-blue-600'}`}></div>}
                    {isFirst && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#D4AF37] to-[#FBF091] shadow-[0_0_15px_rgba(212,175,55,0.6)]"></div>}

                    {/* Rank */}
                    <div className="flex items-center gap-4 md:justify-center pl-2 md:pl-0 mb-2 md:mb-0 relative z-10">
                      <span className={`font-black italic transition-all ${isFirst ? 'text-gold-gradient drop-shadow-md text-4xl' : isTopTen ? 'text-white/80 text-2xl' : `text-white/30 text-xl ${!isAnonymous && 'group-hover:text-white/50'}`}`}>
                        {String(rank).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Player */}
                    <div className="pl-2 md:pl-0 flex items-center gap-4 relative z-10">
                      <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black border shadow-md ${isFirst ? 'bg-[#D4AF37]/20 text-[#FBF091] border-[#D4AF37]/40 shadow-[0_0_15px_rgba(212,175,55,0.3)]' : `bg-white/5 border-white/10 transition-colors ${!isAnonymous ? 'text-white/60 group-hover:border-cyan-500/50 group-hover:text-cyan-400' : 'text-white/20 border-white/5'}`}`}>
                        {initials}
                      </div>
                      <div>
                        <div className={`font-black tracking-tight transition-colors block ${isFirst ? 'text-xl text-white drop-shadow-md' : `text-[15px] ${isAnonymous ? 'text-white/40 italic' : 'text-white/90 group-hover:text-white'}`}`}>
                          {displayName}
                        </div>
                        <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold">
                          {displayLocation}
                        </span>
                      </div>
                    </div>

                    {/* Results */}
                    <div className="hidden md:flex justify-center relative z-10">
                      <span className={`text-[10px] text-white/40 uppercase tracking-widest font-bold bg-white/5 px-3 py-1.5 rounded-lg border transition-colors ${!isAnonymous ? 'border-white/5 group-hover:border-white/10' : 'border-transparent'}`}>
                        {player.result_count} Events
                      </span>
                    </div>

                    {/* Points */}
                    <div className="flex justify-between items-center md:justify-end w-full pl-2 md:pl-0 mt-2 md:mt-0 relative z-10">
                      <span className="md:hidden text-[10px] text-white/40 uppercase tracking-widest font-bold">Points</span>
                      <span className={`font-mono font-black ${isFirst ? 'text-2xl text-gold-gradient' : 'text-xl text-white/90'}`}>
                        {player.total_points.toFixed(2)}
                      </span>
                    </div>

                    {/* Prize Money */}
                    <div className="flex justify-between items-center md:justify-end w-full md:pr-4 pl-2 md:pl-0 relative z-10">
                      <span className="md:hidden text-[10px] text-white/40 uppercase tracking-widest font-bold">Earnings</span>
                      <span className={`font-black ${player.total_prize_money > 0 ? (isFirst ? 'text-xl text-white drop-shadow-md' : 'text-lg text-emerald-400') : 'text-white/20 italic text-sm'}`}>
                        {player.total_prize_money > 0 ? `£${player.total_prize_money.toLocaleString()}` : '—'}
                      </span>
                    </div>
                  </>
                )

                if (isAnonymous) {
                  return (
                    <div key={player.player_id} className={`flex flex-col md:grid md:grid-cols-[80px_1fr_100px_120px_140px] gap-4 p-5 md:items-center border-b border-white/5 last:border-0 relative ${isFirst ? 'bg-gradient-to-r from-[#D4AF37]/10 to-transparent' : ''}`}>
                      {rowContent}
                    </div>
                  )
                }

                return (
                  <Link key={player.player_id} href={`/players/${player.player_id}`} className={`group flex flex-col md:grid md:grid-cols-[80px_1fr_100px_120px_140px] gap-4 p-5 md:items-center border-b border-white/5 last:border-0 hover:bg-gradient-to-r hover:from-white/5 hover:to-transparent transition-all relative ${isFirst ? 'bg-gradient-to-r from-[#D4AF37]/10 to-transparent' : ''}`}>
                    {rowContent}
                  </Link>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* --- GRID VIEW --- */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {paginated.length === 0 ? (
            <div className="col-span-full glass-panel p-16 text-center text-white/30 font-bold uppercase tracking-widest text-sm rounded-3xl border-dashed border-2 border-white/10">No players found</div>
          ) : (
            paginated.map(player => {
              const rank = nplRankMap.get(player.player_id) || 0
              const isFirst = rank === 1
              const isAnonymous = !player.gdpr

              const displayName = isAnonymous ? 'Anonymous Player' : player.full_name
              const displayLocation = isAnonymous ? 'Location Hidden' : (player.home_casino || 'Location Unknown')
              const initials = isAnonymous ? '?' : player.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)

              const cardContent = (
                <div className={`relative bg-[#0A0A10] h-full rounded-[23px] p-6 flex flex-col justify-between overflow-hidden ${isAnonymous ? 'opacity-80' : ''}`}>
                  {/* Glowing Core for #1 */}
                  {isFirst && <div className="absolute top-[-50%] right-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.15)_0%,transparent_50%)] animate-pulse pointer-events-none" />}

                  <div>
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-black border-2 shadow-lg ${isFirst ? 'bg-[#D4AF37]/20 text-[#FBF091] border-[#FBF091] shadow-[0_0_15px_rgba(212,175,55,0.4)]' : `bg-white/5 transition-all ${!isAnonymous ? 'text-cyan-400 border-cyan-400/30 group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(0,243,255,0.4)]' : 'text-white/30 border-white/10'}`}`}>
                        {initials}
                      </div>
                      <div className={`font-black italic drop-shadow-md ${isFirst ? 'text-4xl text-gold-gradient' : `text-3xl text-white/20 transition-colors ${!isAnonymous && 'group-hover:text-white/40'}`}`}>
                        #{rank}
                      </div>
                    </div>

                    <div className="relative z-10">
                      <h4 className={`font-black text-xl mb-1 leading-tight ${isFirst ? 'text-white' : `text-white/90 ${isAnonymous ? 'italic text-white/50' : 'group-hover:text-white'}`}`}>{displayName}</h4>
                      <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-6">
                        {displayLocation}
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 border-t border-white/10 pt-5 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[9px] text-white/40 uppercase tracking-[2px] font-bold mb-1">Points</div>
                      <div className={`font-mono font-black ${isFirst ? 'text-2xl text-gold-gradient' : 'text-xl text-white'}`}>
                        {player.total_points.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-white/40 uppercase tracking-[2px] font-bold mb-1">Results</div>
                      <div className="font-mono font-black text-xl text-white">
                        {player.result_count}
                      </div>
                    </div>
                    {player.total_prize_money > 0 && (
                      <div className="col-span-2 pt-2 border-t border-white/5">
                        <div className="text-[9px] text-white/40 uppercase tracking-[2px] font-bold mb-1">Earnings</div>
                        <div className={`font-black ${isFirst ? 'text-lg text-white' : 'text-lg text-emerald-400'}`}>
                          £{player.total_prize_money.toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )

              if (isAnonymous) {
                return (
                  <div key={player.player_id} className="relative block rounded-3xl p-[1px] bg-white/10 cursor-default">
                    {isFirst && <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37] to-[#FBF091] rounded-3xl shadow-[0_0_20px_rgba(212,175,55,0.5)]"></div>}
                    {cardContent}
                  </div>
                )
              }

              return (
                <Link key={player.player_id} href={`/players/${player.player_id}`} className="group relative block rounded-3xl p-[1px] bg-white/10 hover:bg-gradient-to-b hover:from-cyan-400 hover:to-blue-600 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(0,243,255,0.2)]">
                  {isFirst && <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37] to-[#FBF091] rounded-3xl shadow-[0_0_20px_rgba(212,175,55,0.5)]"></div>}
                  {cardContent}
                </Link>
              )
            })
          )}
        </div>
      )}

      {/* --- PAGINATION --- */}
      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row items-center justify-between mt-12 pt-8 border-t border-white/10 gap-6">
          <div className="text-[10px] text-white/50 tracking-[3px] uppercase font-black">
            Displaying {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </div>
          
          <div className="flex gap-2">
            <PageBtn onClick={() => setPage(1)} disabled={page === 1} label="«" />
            <PageBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} label="‹" />
            
            {getPageNumbers(page, totalPages).map((p, i) =>
              p === '...' ? (
                <span key={`e${i}`} className="w-10 flex items-center justify-center text-white/30 font-bold">...</span>
              ) : (
                <button 
                  key={p} 
                  onClick={() => setPage(p as number)} 
                  className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${page === p ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(0,243,255,0.2)]' : 'bg-black/50 border border-white/10 text-white/40 hover:border-white/30 hover:text-white'}`}
                >
                  {p}
                </button>
              )
            )}
            
            <PageBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} label="›" />
            <PageBtn onClick={() => setPage(totalPages)} disabled={page === totalPages} label="»" />
          </div>
        </div>
      )}
    </div>
  )
}

function PageBtn({ onClick, disabled, label }: { onClick: () => void, disabled: boolean, label: string }) {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black transition-all ${disabled ? 'bg-black/20 border border-white/5 text-white/10 cursor-not-allowed' : 'bg-black/50 border border-white/10 text-white/40 hover:border-cyan-400 hover:text-cyan-400'}`}
    >
      {label}
    </button>
  )
}

function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 3) return [1, 2, 3, 4, '...', total]
  if (current >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
}