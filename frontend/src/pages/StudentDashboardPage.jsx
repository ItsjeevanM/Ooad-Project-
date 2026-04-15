import { useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { fetchStudentAssignments, fetchStudentAttendance, fetchStudentCourses, fetchStudentMarks } from '../api/studentApi'
import SummaryCardSkeleton from '../components/dashboard/SummaryCardSkeleton'

function StudentDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [courses, setCourses] = useState([])
  const [assignments, setAssignments] = useState([])
  const [marks, setMarks] = useState([])
  const [attendance, setAttendance] = useState([])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true); setError('')
      try {
        const [c, a, m, att] = await Promise.all([
          fetchStudentCourses({ page: 0, size: 50, sortBy: 'enrolledAt', sortDir: 'desc' }),
          fetchStudentAssignments({ page: 0, size: 50, sortBy: 'deadline', sortDir: 'asc' }),
          fetchStudentMarks({ page: 0, size: 100, sortBy: 'enrolledAt', sortDir: 'desc' }),
          fetchStudentAttendance({ page: 0, size: 100, sortBy: 'sessionDate', sortDir: 'desc' }),
        ])
        if (!mounted) return
        setCourses(c?.content ?? [])
        setAssignments(a?.content ?? [])
        setMarks(m?.content ?? [])
        setAttendance(att?.content ?? [])
      } catch (e) {
        if (mounted) setError(e?.response?.data?.message || 'Failed to load dashboard data.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const now = new Date()
  const upcoming = useMemo(() => assignments.filter(a => a.deadline && new Date(a.deadline) >= now), [assignments])
  const avgMarks = useMemo(() => {
    const pct = marks.map(m => m.percentage).filter(v => typeof v === 'number')
    return pct.length ? (pct.reduce((s, v) => s + v, 0) / pct.length).toFixed(1) : '—'
  }, [marks])
  const attendancePct = useMemo(() => {
    if (!attendance.length) return '—'
    const ok = attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length
    return ((ok / attendance.length) * 100).toFixed(1)
  }, [attendance])
  const courseTitles = useMemo(() => {
    const m = new Map(); courses.forEach(c => c.courseId && m.set(c.courseId, c.title)); return m
  }, [courses])

  const getStatusColor = (status) => {
    const s = { PASSED: 'var(--accent-emerald)', FAILED: 'var(--accent-rose)', ACTIVE: 'var(--accent-cyan)', DROPPED: 'var(--accent-rose)', COMPLETED: 'var(--accent-violet)' }
    return s[status] || 'var(--text-muted)'
  }

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: 18 }}>
          <div style={{ height: 24, width: 200, background: 'var(--bg-card)', borderRadius: 6, marginBottom: 8 }} />
          <div style={{ height: 14, width: 280, background: 'var(--bg-card)', borderRadius: 5, opacity: 0.5 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
          <SummaryCardSkeleton /><SummaryCardSkeleton /><SummaryCardSkeleton /><SummaryCardSkeleton />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ height: 260, background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }} />
          <div style={{ height: 260, background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 360,
        flexDirection: 'column', gap: 10,
      }}>
        <p style={{ color: 'var(--accent-rose)', fontSize: '0.85rem' }}>{error}</p>
      </div>
    )
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100%', display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Greeting */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0] || 'Student'}
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Here's an overview of your academic progress.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 2 }}>
        {[
          { title: 'Enrolled Courses', value: courses.length, subtitle: 'Active enrollments' },
          { title: 'Upcoming', value: upcoming.length, subtitle: 'Pending deadlines' },
          { title: 'Avg. Marks', value: typeof avgMarks === 'string' ? avgMarks : `${avgMarks}%`, subtitle: 'Across graded items' },
          { title: 'Attendance', value: attendance.length ? `${attendancePct}%` : '—', subtitle: 'Present + Late' },
        ].map((card) => (
          <div key={card.title} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-xl)', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{card.title}</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#2563eb', lineHeight: 1, marginBottom: 4 }}>{card.value}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{card.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Courses & Assignments */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>

        {/* Enrolled courses */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-xl)', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>Enrolled Courses</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{courses.length} total</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {courses.length === 0 && (
              <EmptyMsg text="No enrolled courses yet." />
            )}
            {courses.slice(0, 6).map(c => (
              <div key={c.enrollmentId || c.courseId} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 12px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 'var(--radius-md)',
                transition: 'background 0.12s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
              >
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{c.title || 'Untitled'}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{c.subjectCode || c.code || 'No code'}</p>
                </div>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                  background: `${getStatusColor(c.enrollmentStatus)}18`,
                  color: getStatusColor(c.enrollmentStatus),
                  border: `1px solid ${getStatusColor(c.enrollmentStatus)}30`,
                }}>
                  {c.enrollmentStatus || 'ACTIVE'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming assignments */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-xl)', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>Upcoming Assignments</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{upcoming.length} pending</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {upcoming.length === 0 && <EmptyMsg text="No upcoming assignments." />}
            {upcoming.slice(0, 6).map(a => {
              const dueDate = new Date(a.deadline)
              const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
              const urgent = daysLeft <= 3
              return (
                <div key={a.assignmentId} style={{
                  padding: '9px 12px',
                  background: urgent ? '#fff1f2' : '#ffffff',
                  border: `1px solid ${urgent ? 'rgba(201,107,122,0.2)' : '#e2e8f0'}`,
                  borderRadius: 'var(--radius-md)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{a.title}</p>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 600, padding: '2px 6px', borderRadius: 99, whiteSpace: 'nowrap', flexShrink: 0,
                      color: urgent ? 'var(--accent-rose)' : 'var(--accent-amber)',
                      background: urgent ? 'rgba(201,107,122,0.12)' : 'rgba(212,168,83,0.12)',
                    }}>
                      {daysLeft <= 0 ? 'OVERDUE' : `${daysLeft}d left`}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {courseTitles.get(a.courseId) || 'Course'} · {dueDate.toLocaleDateString()}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent marks */}
      {marks.length > 0 && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-xl)', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>Recent Marks</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Latest graded submissions</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
            {marks.slice(0, 6).map((m, i) => {
              const pct = typeof m.percentage === 'number' ? m.percentage : (m.marksObtained != null && m.maxMarks ? ((m.marksObtained / m.maxMarks) * 100) : null)
              const color = pct >= 80 ? 'var(--accent-emerald)' : pct >= 60 ? 'var(--accent-amber)' : 'var(--accent-rose)'
              return (
                <div key={m.marksId || i} style={{
                  padding: '10px 12px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {m.assignmentTitle || `Submission ${i + 1}`}
                    </p>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color }}>{pct != null ? `${pct.toFixed(0)}%` : `${m.marksObtained ?? '—'}/${m.maxMarks ?? '—'}`}</span>
                  </div>
                  {m.feedback && (
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {m.feedback}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyMsg({ text }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 16px',
      color: 'var(--text-muted)', fontSize: '0.8rem',
    }}>
      {text}
    </div>
  )
}

export default StudentDashboardPage
