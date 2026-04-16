export default function Footer() {
  return (
    <footer style={{
      background: '#0a0820',
      borderTop: '1px solid rgba(67,121,255,0.15)',
      padding: '32px 48px',
      marginTop: 'auto',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        <div>
          <div style={{
            fontSize: '13px',
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}>
            National Poker League
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
            © 2026 National Poker League. All rights reserved.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '28px' }}>
          {[
            { label: 'High Roller League', color: '#e8c870' },
            { label: 'Low Roller League', color: '#60c890' },
          ].map(item => (
            <div key={item.label} style={{
              fontSize: '11px',
              color: item.color,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              opacity: 0.7,
            }}>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}
