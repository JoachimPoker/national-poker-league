import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const revalidate = 300

export default async function EventsPage() {
  const { data: season } = await supabase
    .from('seasons')
    .select('*')
    .eq('is_active', true)
    .single()

  const seasonId = season?.id || 1

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('season_id', seasonId)
    .order('start_date', { ascending: false })

  // Tally entries per event
  let allResultCounts: any[] = []
  let from = 0
  while (true) {
    const { data } = await supabase
      .from('results')
      .select('event_id')
      .eq('season_id', seasonId)
      .range(from, from + 999)
    if (!data || data.length === 0) break
    allResultCounts = allResultCounts.concat(data)
    if (data.length < 1000) break
    from += 1000
  }

  const countMap = new Map<number, number>()
  for (const r of allResultCounts) {
    countMap.set(r.event_id, (countMap.get(r.event_id) || 0) + 1)
  }

  const allEvents = events || []
  const highRollers = allEvents.filter(e => e.is_high_roller)
  const mainEvents = allEvents.filter(e => !e.is_high_roller && !e.is_low_roller)
  const lowRollers = allEvents.filter(e => e.is_low_roller)

  return (
    <div className="min-h-screen bg-[#040408] text-white flex flex-col font-sans relative overflow-hidden">
      
      {/* GLOBAL AMBIENT LIGHTING & GRID */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 casino-grid opacity-40"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-[150px] animate-float mix-blend-screen"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[40vw] h-[40vw] bg-purple-600/20 rounded-full blur-[150px] animate-float-delayed mix-blend-screen"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        {/* HEADER SECTION */}
        <section className="relative bg-black/40 border-b border-white/10 pt-16 pb-12 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <div className="flex items-center gap-4 mb-6">
              <span className="h-[2px] w-8 bg-gradient-to-r from-transparent to-cyan-400"></span>
              <span className="text-cyan-400 text-[10px] tracking-[5px] uppercase font-black">
                {season?.name || '2026 Season'}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mb-4 drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
              The <span className="text-gold-gradient drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">Circuit</span>
            </h1>
            <p className="text-white/50 text-sm md:text-base max-w-2xl font-medium mb-12">
              All official tournaments across the season. Select any event to access its complete vault of results and analytics.
            </p>

            {/* Neon Stats */}
            <div className="grid grid-cols-2 md:flex md:gap-16 gap-y-8 pt-8 border-t border-white/10">
              {[
                { value: allEvents.length, label: 'Total Events', color: 'from-white to-gray-400' },
                { value: mainEvents.length, label: 'Main Events', color: 'from-cyan-400 to-blue-500' },
                { value: highRollers.length, label: 'High Roller', color: 'from-amber-400 to-yellow-600' },
                { value: lowRollers.length, label: 'Low Roller', color: 'from-emerald-400 to-green-600' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className={`text-4xl md:text-5xl font-black mb-1 bg-gradient-to-br ${stat.color} text-transparent bg-clip-text drop-shadow-md`}>
                    {stat.value}
                  </div>
                  <div className="text-[9px] text-white/40 tracking-[3px] uppercase font-bold">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MAIN LISTINGS */}
        <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 md:px-12 py-16">
          {[
            { 
              label: 'High Roller Events', 
              events: highRollers, 
              gradient: 'from-amber-500 to-yellow-300',
              badgeColor: 'text-amber-400 bg-amber-400/10 border-amber-400/30'
            },
            { 
              label: 'Main Events', 
              events: mainEvents, 
              gradient: 'from-cyan-400 to-blue-500',
              badgeColor: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30'
            },
            { 
              label: 'Low Roller Events', 
              events: lowRollers, 
              gradient: 'from-emerald-400 to-green-500',
              badgeColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30'
            },
          ].map(group => group.events.length > 0 && (
            <div key={group.label} className="mb-16 last:mb-0">
              
              {/* Group Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-1.5 h-6 rounded-full bg-gradient-to-b ${group.gradient} shadow-[0_0_10px_currentColor]`} />
                <h2 className="text-[12px] font-black text-white/80 tracking-[4px] uppercase drop-shadow-md">
                  {group.label}
                </h2>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent" />
                <span className="text-[10px] uppercase tracking-widest font-bold text-white/30">
                  {group.events.length} Events
                </span>
              </div>

              {/* Event Cards Container */}
              <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
                <div className="bg-black/50 backdrop-blur-xl">
                  
                  {/* Desktop Columns Header */}
                  <div className="hidden lg:grid grid-cols-[1fr_200px_120px_100px_140px] gap-6 p-6 border-b border-white/10 bg-white/5 text-[9px] uppercase tracking-[3px] font-black text-white/40">
                    <div>Tournament</div>
                    <div>Date</div>
                    <div className="text-right">Buy-in</div>
                    <div className="text-right">Entries</div>
                    <div className="text-right pr-2">Classification</div>
                  </div>

                  {group.events.map(event => (
                    <Link key={event.id} href={`/events/${event.id}`} className="group relative flex flex-col lg:grid lg:grid-cols-[1fr_200px_120px_100px_140px] gap-4 lg:gap-6 p-6 items-start lg:items-center border-b border-white/5 last:border-0 hover:bg-white/5 transition-all">
                      
                      {/* Neon Hover Edge */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${group.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                      
                      {/* 1. Name & Location */}
                      <div className="pl-2 lg:pl-0 w-full">
                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-white drop-shadow-md transition-colors leading-tight">
                          {event.tournament_name}
                        </h3>
                        <div className="text-xs text-white/40 font-mono flex items-center gap-2">
                          <span className="inline-block w-2 h-2 rounded-full bg-white/10 border border-white/20"></span>
                          {event.casino}
                        </div>
                      </div>

                      {/* 2. Date */}
                      <div className="pl-2 lg:pl-0 text-sm text-white/60 font-mono">
                        {event.start_date
                          ? new Date(event.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                          : 'TBD'}
                      </div>

                      {/* Mobile Flex Container for remaining stats */}
                      <div className="flex justify-between items-center w-full lg:contents pl-2 lg:pl-0 mt-2 lg:mt-0">
                        {/* 3. Buy In */}
                        <div className="text-lg lg:text-right font-black text-white group-hover:scale-105 transition-transform transform origin-left lg:origin-right">
                          £{Number(event.buy_in).toLocaleString()}
                        </div>

                        {/* 4. Entries */}
                        <div className="text-xs lg:text-right text-white/40 font-bold uppercase tracking-widest bg-black/40 lg:bg-transparent px-3 py-1.5 lg:p-0 rounded-lg lg:rounded-none border border-white/5 lg:border-none">
                          {countMap.get(event.id) || 0} <span className="lg:hidden">Entries</span>
                        </div>

                        {/* 5. Badge */}
                        <div className="text-right">
                          <span className={`text-[9px] font-black tracking-widest uppercase px-3 py-1.5 rounded-lg border ${group.badgeColor} shadow-sm`}>
                            {event.is_high_roller ? 'High Roller' : event.is_low_roller ? 'Low Roller' : 'Main Event'}
                          </span>
                        </div>
                      </div>

                    </Link>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </main>

        <Footer />
      </div>
    </div>
  )
}