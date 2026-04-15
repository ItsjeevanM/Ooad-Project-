function AuthInitSkeleton() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      padding: 24,
    }}>
      <div style={{ maxWidth: 800, margin: '64px auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ height: 28, width: 200, borderRadius: 6, background: 'var(--bg-card)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ height: 120, borderRadius: 'var(--radius-xl)', background: 'var(--bg-card)' }} />
          <div style={{ height: 120, borderRadius: 'var(--radius-xl)', background: 'var(--bg-card)' }} />
        </div>
        <div style={{ height: 220, borderRadius: 'var(--radius-xl)', background: 'var(--bg-card)' }} />
      </div>
    </div>
  )
}

export default AuthInitSkeleton
