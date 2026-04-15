import { useEffect, useMemo, useState } from 'react'
import { fetchStudentCourses } from '../../api/studentApi'

function CoursesPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [courses, setCourses] = useState([])
  const [search, setSearch] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState('')

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true)
      setError('')
      try {
        const coursesPage = await fetchStudentCourses({ page: 0, size: 100, sortBy: 'enrolledAt', sortDir: 'desc' })
        const courseList = coursesPage?.content ?? []
        setCourses(courseList)
        setSelectedCourseId(courseList[0]?.courseId || '')
      } catch (loadError) {
        setError(loadError?.response?.data?.message || 'Failed to load courses.')
      } finally {
        setLoading(false)
      }
    }
    loadCourses()
  }, [])

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return courses
    return courses.filter((course) =>
      [course.title, course.subjectCode, course.enrollmentStatus]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    )
  }, [courses, search])

  const selectedCourse = useMemo(() => {
    if (!filteredCourses.length) return null
    return filteredCourses.find((course) => course.courseId === selectedCourseId) || filteredCourses[0]
  }, [filteredCourses, selectedCourseId])

  const stats = useMemo(() => {
    const activeCount = courses.filter((course) => String(course.enrollmentStatus).toUpperCase() === 'ACTIVE').length
    return {
      totalCourses: courses.length,
      activeCourses: activeCount,
      filteredResults: filteredCourses.length,
      latestEnrollment: courses[0]?.enrolledAt ? new Date(courses[0].enrolledAt).toLocaleDateString() : 'N/A',
    }
  }, [courses, filteredCourses])

  if (loading) {
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ height: 110, background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14 }}>
          <div style={{ height: 320, background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }} />
          <div style={{ height: 320, background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }} />
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
          { label: 'Total Courses', value: stats.totalCourses, sub: 'All enrolled courses', color: 'var(--accent-cyan)' },
          { label: 'Active Courses', value: stats.activeCourses, sub: 'Status marked ACTIVE', color: 'var(--accent-emerald)' },
          { label: 'Filtered Results', value: stats.filteredResults, sub: 'Matching your search', color: 'var(--accent-amber)' },
          { label: 'Latest Enrollment', value: stats.latestEnrollment, sub: 'Most recent added', color: 'var(--accent-violet)' },
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
        placeholder="Search by course name, code, or status..."
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)', background: 'var(--bg-surface)',
          color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none',
          fontFamily: 'inherit',
        }}
      />

      {/* Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14 }}>
        {/* Course list */}
        <div style={{ background: '#f8fbff', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '18px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: 12 }}>Enrolled Courses</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filteredCourses.map((course) => {
              const isActive = selectedCourse?.courseId === course.courseId
              const isActiveStatus = String(course.enrollmentStatus).toUpperCase() === 'ACTIVE'
              return (
                <button
                  key={course.enrollmentId || course.courseId}
                  type="button"
                  onClick={() => setSelectedCourseId(course.courseId)}
                  style={{
                    width: '100%', padding: '10px 12px', textAlign: 'left',
                    borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    border: isActive ? '1px solid var(--border-active)' : '1px solid var(--border)',
                    background: isActive ? '#eff6ff' : '#f8fbff',
                    transition: 'background 0.12s', fontFamily: 'inherit',
                  }}
                >
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{course.title || 'Untitled Course'}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{course.subjectCode || 'No code'}</p>
                  <span style={{
                    display: 'inline-block', marginTop: 6,
                    fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                    background: isActiveStatus ? '#dcfce7' : '#f8fafc',
                    color: isActiveStatus ? 'var(--accent-emerald)' : 'var(--text-muted)',
                  }}>{course.enrollmentStatus || 'UNKNOWN'}</span>
                </button>
              )
            })}
            {!filteredCourses.length && (
              <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                No enrollments yet
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div style={{ background: '#f8fbff', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '18px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: 12 }}>Course Details</h2>
          {!selectedCourse ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Select a course to view details
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Title', value: selectedCourse.title || 'N/A', color: 'var(--accent-cyan)' },
                { label: 'Subject Code', value: selectedCourse.subjectCode || 'N/A', color: 'var(--accent-cyan)' },
                { label: 'Instructor', value: selectedCourse.instructorName || selectedCourse.instructor || selectedCourse.instructorId || 'N/A', color: 'var(--accent-cyan)' },
                { label: 'Enrolled Date', value: selectedCourse.enrolledAt ? new Date(selectedCourse.enrolledAt).toLocaleDateString() : 'N/A', color: 'var(--text-muted)' },
                { label: 'Status', value: selectedCourse.enrollmentStatus || 'N/A', color: 'var(--text-muted)' },
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

export default CoursesPage
