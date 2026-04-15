import { useEffect, useMemo, useState } from 'react'
import { fetchStudentAttendance, fetchStudentCourses } from '../../api/studentApi'

function AttendancePage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attendance, setAttendance] = useState([])
  const [courseTitleById, setCourseTitleById] = useState(new Map())
  const [search, setSearch] = useState('')
  const [selectedAttendanceId, setSelectedAttendanceId] = useState('')

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError('')
      try {
        const [attendancePage, coursesPage] = await Promise.all([
          fetchStudentAttendance({ page: 0, size: 100, sortBy: 'sessionDate', sortDir: 'desc' }),
          fetchStudentCourses({ page: 0, size: 100, sortBy: 'enrolledAt', sortDir: 'desc' }),
        ])
        const attendanceList = attendancePage?.content ?? []
        const courses = coursesPage?.content ?? []
        const index = new Map()
        courses.forEach((course) => {
          if (course.courseId) index.set(course.courseId, course.title)
        })
        setAttendance(attendanceList)
        setCourseTitleById(index)
        setSelectedAttendanceId(attendanceList[0]?.attendanceId || '')
      } catch (loadError) {
        setError(loadError?.response?.data?.message || 'Failed to load attendance data.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredAttendance = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return attendance
    return attendance.filter((entry) => {
      const courseName = courseTitleById.get(entry.courseId)
      return [entry.sessionDate, entry.status, entry.courseId, courseName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    })
  }, [attendance, search, courseTitleById])

  const selectedSession = useMemo(() => {
    if (!filteredAttendance.length) return null
    return filteredAttendance.find((entry) => entry.attendanceId === selectedAttendanceId) || filteredAttendance[0]
  }, [filteredAttendance, selectedAttendanceId])

  const stats = useMemo(() => {
    const present = attendance.filter((entry) => String(entry.status).toUpperCase() === 'PRESENT').length
    const late = attendance.filter((entry) => String(entry.status).toUpperCase() === 'LATE').length
    const totalSessions = attendance.length
    const presentLikeCount = present + late
    const attendanceRate = totalSessions ? (presentLikeCount * 100) / totalSessions : 0
    return { totalSessions, present, late, attendanceRate }
  }, [attendance])

  const getStatusColor = (status) => {
    const s = String(status || '').toUpperCase()
    if (s === 'PRESENT') return 'var(--accent-emerald)'
    if (s === 'ABSENT') return 'var(--accent-rose)'
    return 'var(--accent-amber)'
  }

  const getAttendanceRateColor = (rate) => {
    if (rate > 75) return 'var(--accent-emerald)'
    if (rate >= 60) return 'var(--accent-amber)'
    return 'var(--accent-rose)'
  }

  if (loading) {
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ height: 110, background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14 }}>
          <div style={{ height: 380, background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }} />
          <div style={{ height: 380, background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ display: 'flex', minHeight: 300, alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--accent-rose)' }}>{error}</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: 'Total Sessions', value: stats.totalSessions, sub: 'Recorded sessions', color: 'var(--accent-violet)' },
          { label: 'Present', value: stats.present, sub: 'Sessions marked present', color: 'var(--accent-emerald)' },
          { label: 'Late', value: stats.late, sub: 'Late arrivals', color: 'var(--accent-amber)' },
          { label: 'Attendance Rate', value: `${stats.attendanceRate.toFixed(1)}%`, sub: 'Present + late ratio', color: getAttendanceRateColor(stats.attendanceRate) },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--bg-card)', border: `1px solid ${s.color}25`,
            borderRadius: 'var(--radius-xl)', padding: '16px 18px',
          }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 700, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search by date, status, or course..."
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)', background: 'var(--bg-surface)',
          color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none',
          fontFamily: 'inherit',
        }}
      />

      {/* Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14 }}>
        {/* List */}
        <div style={{ background: '#f8fbff', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '18px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: 12 }}>Attendance Sessions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filteredAttendance.map((entry) => {
              const isActive = selectedSession?.attendanceId === entry.attendanceId
              const courseName = courseTitleById.get(entry.courseId) || entry.courseId || 'Course'
              const status = String(entry.status || 'LATE').toUpperCase()
              const statusLabel = status === 'PRESENT' ? 'Present' : status === 'ABSENT' ? 'Absent' : 'Late'
              return (
                <button
                  key={entry.attendanceId}
                  type="button"
                  onClick={() => setSelectedAttendanceId(entry.attendanceId)}
                  style={{
                    width: '100%', padding: '10px 12px', textAlign: 'left',
                    borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    border: isActive ? '1px solid var(--border-active)' : '1px solid var(--border)',
                    background: isActive ? '#eff6ff' : '#f8fbff',
                    transition: 'background 0.12s', fontFamily: 'inherit',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{entry.sessionDate || 'Date unavailable'}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{courseName}</p>
                    </div>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                      background: '#dbeafe', color: getStatusColor(status),
                    }}>{statusLabel}</span>
                  </div>
                </button>
              )
            })}
            {!filteredAttendance.length && (
              <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                No attendance sessions found
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div style={{ background: '#f8fbff', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '18px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: 12 }}>Selected Session</h2>
          {!selectedSession ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Select a session to view details
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Date', value: selectedSession.sessionDate || 'N/A', color: 'var(--accent-cyan)' },
                { label: 'Course', value: courseTitleById.get(selectedSession.courseId) || selectedSession.courseId || 'N/A', color: 'var(--accent-cyan)' },
                { label: 'Status', value: selectedSession.status || 'N/A', color: getStatusColor(selectedSession.status) },
                { label: 'Recorded By', value: selectedSession.recordedBy || selectedSession.markedBy || selectedSession.instructorName || 'N/A', color: 'var(--text-muted)' },
                { label: 'Time', value: selectedSession.recordedAt || selectedSession.enrolledAt || selectedSession.createdAt || selectedSession.sessionTime || 'N/A', color: 'var(--text-muted)' },
              ].map(item => (
                <div key={item.label} style={{
                  padding: '10px 12px', borderRadius: 'var(--radius-md)',
                  background: `${item.color}08`, border: `1px solid ${item.color}20`,
                }}>
                  <p style={{ fontSize: '0.65rem', fontWeight: 600, color: item.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{item.label}</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AttendancePage
