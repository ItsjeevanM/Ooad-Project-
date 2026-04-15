const accentMap = {
  cyan: { text: 'var(--accent-cyan)', bg: 'rgba(44,102,110,0.1)', border: 'rgba(78, 217, 235, 0.25)' },
  amber: { text: 'var(--accent-amber)', bg: 'rgba(212,168,83,0.1)', border: 'rgba(212,168,83,0.25)' },
  emerald: { text: 'var(--accent-emerald)', bg: 'rgba(91,174,138,0.1)', border: 'rgba(91,174,138,0.25)' },
  violet: { text: 'var(--accent-violet)', bg: 'rgba(138,127,189,0.1)', border: 'rgba(138,127,189,0.25)' },
  rose: { text: 'var(--accent-rose)', bg: 'rgba(201,107,122,0.1)', border: 'rgba(201,107,122,0.25)' },
}

function SummaryCard({ title, value, subtitle, accent = 'cyan', icon }) {
  const a = accentMap[accent] || accentMap.cyan
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: '18px 20px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.15s ease, border-color 0.15s ease',
        boxShadow: 'var(--shadow-sm)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.borderColor = '#bfdbfe'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'var(--border)'
      }}
    >
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 60, height: 60, borderRadius: '0 0 0 60px',
        background: 'rgba(37,99,235,0.06)', pointerEvents: 'none',
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</p>
        {icon && <span style={{ fontSize: 16, opacity: 0.6 }}>{icon}</span>}
      </div>
      <p style={{ fontSize: '2rem', fontWeight: 700, color: a.text, lineHeight: 1, marginBottom: 6 }}>{value}</p>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{subtitle}</p>
    </div>
  )
}

export default SummaryCard
