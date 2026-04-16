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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#080818' }}>
      <Navbar />

      {/* Header */}
      <section style={{
        background: '#0a0820',
        padding: '48px 48px 40px',
        borderBottom: '1px solid rgba(67,121,255,0.15)',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{
            fontSize: '10px', color: '#4379FF', letterSpacing: '4px',
            textTransform: 'uppercase', fontWeight: 700, marginBottom: '12px',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <span style={{ width: '28px', height: '1px', background: '#4379FF', display: 'inline-block' }} />
            National Poker League
          </div>
          <h1 style={{ fontSize: '40px', fontWeight: 900, color: '#ffffff', letterSpacing: '-1px', marginBottom: '8px' }}>
            News &amp; Announcements
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
            Latest updates from the National Poker League
          </p>
        </div>
      </section>

      <main style={{ flex: 1, maxWidth: '900px', margin: '0 auto', width: '100%', padding: '48px 48px 64px' }}>
        {allNews.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 40px',
            background: '#0d0d2a', border: '1px solid rgba(67,121,255,0.15)',
            borderRadius: '8px',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📰</div>
            <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
              No news posts yet — check back soon
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {allNews.map((item, index) => (
              <div key={item.id} style={{
                padding: '36px 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px',
                }}>
                  <span style={{
                    fontSize: '10px', color: '#4379FF', letterSpacing: '2px',
                    textTransform: 'uppercase', fontWeight: 700,
                  }}>
                    {new Date(item.published_at).toLocaleDateString('en-GB', {
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </span>
                  {index === 0 && (
                    <span style={{
                      background: '#1F1A5A', color: '#4379FF',
                      fontSize: '9px', padding: '3px 10px', borderRadius: '4px',
                      letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700,
                      border: '1px solid rgba(67,121,255,0.3)',
                    }}>
                      Latest
                    </span>
                  )}
                </div>

                <h2 style={{
                  fontSize: '24px', fontWeight: 900, color: '#ffffff',
                  marginBottom: '12px', lineHeight: 1.3, letterSpacing: '-0.3px',
                }}>
                  {item.title}
                </h2>

                {item.content && (
                  <p style={{
                    fontSize: '15px', color: 'rgba(255,255,255,0.6)',
                    lineHeight: 1.7, marginBottom: '16px',
                  }}>
                    {item.content}
                  </p>
                )}

                {item.social_link && <SocialLink href={item.social_link} />}
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

function SocialLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        fontSize: '12px', color: '#4379FF', fontWeight: 700,
        letterSpacing: '1px', textTransform: 'uppercase',
        border: '1px solid rgba(67,121,255,0.3)',
        padding: '8px 18px', borderRadius: '4px',
        background: 'rgba(67,121,255,0.08)',
      }}
    >
      View social post ›
    </a>
  )
}