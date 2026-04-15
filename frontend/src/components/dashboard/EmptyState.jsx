function EmptyState({ title, description }) {
  return (
    <div style={{
      borderRadius: 'var(--radius-lg)',
      border: '1px dashed var(--border)',
      background: '#ffffff',
      padding: '24px',
      textAlign: 'center',
    }}>
      <p style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-cyan)' }}>{title}</p>
      <p style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{description}</p>
    </div>
  )
}

export default EmptyState
