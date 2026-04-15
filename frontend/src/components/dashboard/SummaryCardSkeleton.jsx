function SummaryCardSkeleton() {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)',
      padding: '18px 20px',
      height: 110,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, transparent 0%, rgba(37,99,235,0.04) 50%, transparent 100%)',
        animation: 'shimmer 1.5s infinite',
        backgroundSize: '200% 100%',
      }} />
    </div>
  )
}

export default SummaryCardSkeleton
