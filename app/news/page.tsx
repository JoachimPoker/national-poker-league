import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const revalidate = 300

export default async function NewsPage() {
  const { data: news } = await supabase
    .from('news')
    .select('*')
    .order('published_at', { ascending: false })

  const allNews = news || []

  return (
    <div className="min-h-screen bg-[#040408] text-white flex flex-col font-sans relative overflow-hidden">
      
      {/* GLOBAL AMBIENT LIGHTING & GRID */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 casino-grid opacity-40"></div>
        <div className="absolute top-[10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[150px] animate-float mix-blend-screen"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-600/10 rounded-full blur-[150px] animate-float-delayed mix-blend-screen"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        {/* HEADER SECTION */}
        <section className="relative bg-black/40 border-b border-white/10 pt-16 pb-12 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <div className="flex items-center gap-4 mb-6">
              <span className="h-[2px] w-8 bg-gradient-to-r from-transparent to-purple-500"></span>
              <span className="text-purple-400 text-[10px] tracking-[5px] uppercase font-black">
                National Poker League
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mb-4 drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
              The <span className="text-gold-gradient drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">Wire</span>
            </h1>
            <p className="text-white/50 text-sm md:text-base max-w-2xl font-medium mb-4">
              The official dispatch for the National Poker League. Read the latest announcements, rule updates, and circuit news.
            </p>
          </div>
        </section>

        {/* MAIN FEED */}
        <main className="flex-1 max-w-[900px] mx-auto w-full px-6 md:px-12 py-16">
          {allNews.length === 0 ? (
            <div className="glass-panel p-16 text-center rounded-3xl border-dashed border-2 border-white/10 flex flex-col items-center justify-center">
              <div className="text-4xl mb-4 opacity-50">📰</div>
              <div className="text-white/40 font-bold uppercase tracking-widest text-sm">
                No dispatches on the wire yet.
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              {allNews.map((item, index) => {
                const isLatest = index === 0;
                
                return (
                  <div key={item.id} className={`group relative glass-panel rounded-3xl p-8 md:p-10 overflow-hidden transition-all duration-500 ${isLatest ? 'border-purple-500/30 shadow-[0_10px_40px_rgba(168,85,247,0.1)]' : 'hover:border-white/20'}`}>
                    
                    {/* Glowing Accents */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500 ${isLatest ? 'bg-gradient-to-b from-purple-500 to-cyan-500' : 'bg-white/10 group-hover:bg-purple-500/50'}`}></div>
                    
                    {isLatest && (
                      <div className="absolute top-[-50%] right-[-10%] w-[100%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.05)_0%,transparent_50%)] animate-pulse pointer-events-none" />
                    )}

                    {/* Meta Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
                      <span className="text-[10px] text-purple-400 tracking-[3px] uppercase font-black">
                        {new Date(item.published_at).toLocaleDateString('en-GB', {
                          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                        })}
                      </span>
                      
                      {isLatest && (
                        <span className="bg-purple-500/10 text-purple-400 border border-purple-500/40 text-[9px] tracking-[3px] uppercase px-4 py-1.5 rounded-full font-black shadow-[0_0_15px_rgba(168,85,247,0.3)] backdrop-blur-md">
                          Latest Dispatch
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                      <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight tracking-tight drop-shadow-md">
                        {item.title}
                      </h2>

                      {item.content && (
                        <p className="text-sm md:text-base text-white/60 leading-relaxed mb-8 font-medium">
                          {item.content}
                        </p>
                      )}

                      {/* Social Link CTA */}
                      {item.social_link && <SocialLink href={item.social_link} />}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  )
}

function SocialLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-400/30 hover:bg-cyan-500/20 hover:shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:-translate-y-0.5 transition-all backdrop-blur-md"
    >
      Read Dispatch 
      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
    </a>
  )
}