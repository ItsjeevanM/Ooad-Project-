import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const studentNav = [
  {
    to: '/student/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    to: '/student/courses',
    label: 'My Courses',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    to: '/student/marks',
    label: 'Marks',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    to: '/student/attendance',
    label: 'Attendance',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    to: '/student/materials',
    label: 'Materials',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="19" x2="12" y2="13" /><line x1="9" y1="16" x2="15" y2="16" />
      </svg>
    ),
  },
]

const instructorNav = [
  {
    to: '/instructor/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    to: '/instructor/courses',
    label: 'Courses',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    to: '/instructor/grading',
    label: 'Grading',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    to: '/instructor/attendance',
    label: 'Attendance',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    to: '/instructor/materials',
    label: 'Materials',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="19" x2="12" y2="13" /><line x1="9" y1="16" x2="15" y2="16" />
      </svg>
    ),
  },
]

const routePageTitles = {
  '/student/dashboard': 'Overview',
  '/student/courses': 'My Courses',
  '/student/marks': 'Marks Sheet',
  '/student/attendance': 'Attendance',
  '/student/materials': 'Materials Hub',
  '/instructor/dashboard': 'Instructor Hub',
  '/instructor/courses': 'Manage Courses',
  '/instructor/grading': 'Grade Submissions',
  '/instructor/attendance': 'Mark Attendance',
  '/instructor/materials': 'Manage Materials',
}

function AppShell({ children }) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const location = useLocation()
  const navigate = useNavigate()

  const isStudent = location.pathname.startsWith('/student')
  const isInstructor = location.pathname.startsWith('/instructor')
  const navItems = isStudent ? studentNav : isInstructor ? instructorNav : []
  const pageTitle = routePageTitles[location.pathname] || 'Dashboard'

  const handleSignOut = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const roleColor = {
    STUDENT: 'var(--accent-cyan)',
    INSTRUCTOR: 'var(--accent-amber)',
    ADMIN: 'var(--accent-rose)',
  }[user?.role] || 'var(--accent-cyan)'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>

      {/* Sidebar */}
      {navItems.length > 0 && (
        <aside style={{
          width: 230,
          flexShrink: 0,
          background: '#0f172a',
          borderRight: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100%',
          zIndex: 50,
        }}>
          {/* Logo */}
          <div style={{
            padding: '22px 18px 18px',
            borderBottom: '1px solid #1e293b',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', flexShrink: 0,
              }}>E</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>EduSphere</div>
                <div style={{ fontSize: '0.65rem', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 1 }}>LMS Platform</div>
              </div>
            </div>
          </div>

          {/* Nav items */}
          <nav style={{ flex: 1, padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {navItems.map((item) => {
              const active = location.pathname === item.to
              return (
                <button
                  key={item.to}
                  onClick={() => navigate(item.to)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px', borderRadius: 'var(--radius-md)',
                    border: active ? '1px solid #000000' : '1px solid transparent',
                    background: active
                      ? '#000000'
                      : 'transparent',
                    color: '#ffffff',
                    fontWeight: active ? 600 : 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                    width: '100%',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.background = '#1e293b'
                      e.currentTarget.style.color = '#ffffff'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#ffffff'
                    }
                  }}
                >
                  <span style={{ opacity: active ? 1 : 0.6 }}>{item.icon}</span>
                  {item.label}
                  {active && (
                    <span style={{
                      marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%',
                      background: '#ffffff',
                    }} />
                  )}
                </button>
              )
            })}
          </nav>

          {/* User footer */}
          <div style={{
            padding: '14px 14px',
            borderTop: '1px solid #1e293b',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                background: roleColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600, fontSize: '0.85rem', color: '#ffffff',
              }}>
                {(user?.name || 'U')[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name || 'User'}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {user?.role || '—'}
                </div>
              </div>
              <button
                onClick={handleSignOut}
                title="Sign out"
                style={{
                  border: 'none', background: 'none', cursor: 'pointer',
                  color: '#cbd5e1', padding: 4, borderRadius: 6,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-rose)'}
                onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Main area */}
      <div style={{
        flex: 1,
        marginLeft: navItems.length > 0 ? 230 : 0,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: '#f8fafc',
      }}>
        {/* Top bar */}
        <header style={{
          height: 54,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          borderBottom: '1px solid var(--border)',
          background: '#ffffff',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>EduSphere</span>
            <span style={{ color: 'var(--border)', fontSize: '0.8rem' }}>/</span>
            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{pageTitle}</span>
          </div>

          {navItems.length === 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '5px 10px',
                background: '#ffffff',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
              }}>
                <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)' }}>{user?.name || 'User'}</div>
                <div style={{
                  fontSize: '0.65rem', color: roleColor,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  padding: '2px 6px', borderRadius: 4,
                  background: 'rgba(44,102,110,0.1)',
                }}>{user?.role}</div>
              </div>
              <button
                onClick={handleSignOut}
                style={{
                  padding: '6px 12px', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'transparent', color: 'var(--text-secondary)',
                  fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500,
                  transition: 'all 0.15s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-rose)'; e.currentTarget.style.color = 'var(--accent-rose)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              >
                Sign out
              </button>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              fontSize: '0.75rem',
              background: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '3px 10px',
              color: 'var(--text-muted)',
            }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppShell
