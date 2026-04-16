import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="relative bg-[#040408] border-t border-white/5 pt-16 pb-8 overflow-hidden mt-12">
      {/* Ambient Footer Glows */}
      <div className="absolute bottom-[-50%] left-[-10%] w-[30vw] h-[30vw] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-[-50%] right-[-10%] w-[30vw] h-[30vw] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-4 group inline-flex mb-6">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-900 rounded-lg flex items-center justify-center border border-white/10 shadow-lg">
                <span className="text-sm text-white drop-shadow-md">♠</span>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-base tracking-[0.2em] uppercase italic leading-tight text-white drop-shadow-md">
                  NPL
                </span>
                <span className="text-[8px] tracking-[3px] text-cyan-400 uppercase font-black">
                  Official Circuit
                </span>
              </div>
            </Link>
            <p className="text-xs text-white/40 leading-relaxed max-w-sm font-medium">
              The premier poker league spanning 15 exclusive venues across the United Kingdom. Play your hand, earn your rank, and cement your legacy in the vault.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[10px] font-black tracking-[4px] text-white/60 uppercase mb-6 drop-shadow-md">The Circuit</h4>
            <ul className="flex flex-col gap-4">
              {['Leaderboards', 'Schedule & Events', 'Player Directory', 'Season Archives'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-xs text-white/40 hover:text-cyan-400 font-bold transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support / Legal */}
          <div>
            <h4 className="text-[10px] font-black tracking-[4px] text-white/60 uppercase mb-6 drop-shadow-md">Headquarters</h4>
            <ul className="flex flex-col gap-4">
              {['The Wire (News)', 'Rules & Regulations', 'Contact Administration', 'Privacy Vault'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-xs text-white/40 hover:text-purple-400 font-bold transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10">
          <p className="text-[9px] tracking-[3px] text-white/30 uppercase font-black mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} National Poker League. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[9px] tracking-[3px] text-white/20 uppercase font-black">
              System Status: <span className="text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]">Online</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}