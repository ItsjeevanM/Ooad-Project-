import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div style={{
      display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', padding: 24,
    }}>
      <div style={{
        maxWidth: 420, width: '100%', borderRadius: 'var(--radius-2xl)',
        border: '1px solid var(--border)', background: 'var(--bg-card)',
        padding: '32px', textAlign: 'center',
      }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)' }}>Error 404</p>
        <h1 style={{ marginTop: 8, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Page not found</h1>
        <p style={{ marginTop: 10, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>The page you requested does not exist in this module.</p>
        <Link
          to="/"
          style={{
            display: 'inline-block', marginTop: 20,
            padding: '8px 20px', borderRadius: 99,
            background: 'var(--accent-cyan)', color: '#F0EDEE',
            fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none',
            transition: 'opacity 0.15s',
          }}
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
