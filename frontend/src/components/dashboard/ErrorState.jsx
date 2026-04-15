function ErrorState({ message, onRetry }) {
  return (
    <div style={{
      borderRadius: 'var(--radius-lg)',
      border: '1px solid #bfdbfe',
      background: '#ffffff',
      padding: '24px',
    }}>
      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-rose)' }}>Could not load dashboard data</p>
      <p style={{ marginTop: 4, fontSize: '0.85rem', color: 'var(--accent-rose)', opacity: 0.8 }}>{message}</p>
      <button
        type="button"
        onClick={onRetry}
        style={{
          marginTop: 14,
          padding: '6px 16px',
          borderRadius: 99,
          border: '1px solid #fecdd3',
          background: 'transparent',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--accent-rose)',
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#fff1f2'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        Try again
      </button>
    </div>
  )
}

export default ErrorState
