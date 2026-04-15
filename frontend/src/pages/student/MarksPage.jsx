import { useEffect, useMemo, useState } from 'react'
import { fetchStudentCourses, fetchStudentMarks } from '../../api/studentApi'

function getGradeLabel(mark) {
  if (mark.grade) return String(mark.grade).toUpperCase()
  if (mark.status) return String(mark.status).toUpperCase()
  if (typeof mark.percentage !== 'number') return 'N/A'
  if (mark.percentage >= 90) return 'A+'
  if (mark.percentage >= 80) return 'A'
  if (mark.percentage >= 70) return 'B'
  if (mark.percentage >= 60) return 'C'
  if (mark.percentage >= 50) return 'D'
  return 'F'
}

function getPercentageColor(pct) {
  if (typeof pct !== 'number') return 'var(--text-primary)'
  if (pct > 75) return 'var(--accent-emerald)'
  if (pct >= 50) return 'var(--accent-amber)'
  return 'var(--accent-rose)'
}

function MarksPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [marks, setMarks] = useState([])
  const [courseTitleById, setCourseTitleById] = useState(new Map())
  const [search, setSearch] = useState('')
  const [selectedMarkId, setSelectedMarkId] = useState('')

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError('')
      try {
        const [marksPage, coursesPage] = await Promise.all([
          fetchStudentMarks({ page: 0, size: 100, sortBy: 'enrolledAt', sortDir: 'desc' }),
          fetchStudentCourses({ page: 0, size: 100, sortBy: 'enrolledAt', sortDir: 'desc' }),
        ])
        const marksList = marksPage?.content ?? []
        const courses = coursesPage?.content ?? []
        const index = new Map()
        courses.forEach((course) => {
          if (course.courseId) index.set(course.courseId, course.title)
        })
        setMarks(marksList)
        setCourseTitleById(index)
        setSelectedMarkId(marksList[0]?.marksId || '')
      } catch (loadError) {
        setError(loadError?.response?.data?.message || 'Failed to load marks sheet data.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredMarks = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return marks
    return marks.filter((mark) => {
      const gradeLabel = getGradeLabel(mark)
      const courseName = courseTitleById.get(mark.courseId)
      return [mark.component, mark.courseId, courseName, mark.status, gradeLabel]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    })
  }, [marks, search, courseTitleById])

  const selectedMark = useMemo(() => {
    if (!filteredMarks.length) return null
    return filteredMarks.find((mark) => mark.marksId === selectedMarkId) || filteredMarks[0]
  }, [filteredMarks, selectedMarkId])

  const stats = useMemo(() => {
    const percentages = marks.map((mark) => mark.percentage).filter((value) => typeof value === 'number')
    const gradedItems = marks.filter((mark) => typeof mark.marksAwarded === 'number' || typeof mark.percentage === 'number').length
    const average = percentages.length ? percentages.reduce((sum, value) => sum + value, 0) / percentages.length : 0
    const highest = percentages.length ? Math.max(...percentages) : 0
    return { allRecords: marks.length, gradedItems, average, highest }
  }, [marks])

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
          { label: 'All Records', value: stats.allRecords, sub: 'Total marks entries', color: 'var(--accent-emerald)' },
          { label: 'Graded Items', value: stats.gradedItems, sub: 'Scored assessments', color: 'var(--accent-cyan)' },
          { label: 'Average Score', value: `${stats.average.toFixed(1)}%`, sub: 'Overall percentage', color: 'var(--accent-violet)' },
          { label: 'Highest Score', value: `${stats.highest.toFixed(1)}%`, sub: 'Best performance', color: 'var(--accent-amber)' },
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
        placeholder="Search by component, course, or status..."
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
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: 12 }}>Marks Entries</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filteredMarks.map((mark) => {
              const isActive = selectedMark?.marksId === mark.marksId
              const courseName = courseTitleById.get(mark.courseId) || mark.courseId || 'Course'
              const gradeLabel = getGradeLabel(mark)
              const pct = typeof mark.percentage === 'number' ? mark.percentage : 0
              return (
                <button
                  key={mark.marksId}
                  type="button"
                  onClick={() => setSelectedMarkId(mark.marksId)}
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
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{mark.component || 'Assessment'}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{courseName}</p>
                    </div>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                      background: '#dbeafe', color: 'var(--accent-cyan)',
                    }}>{gradeLabel}</span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ marginTop: 8, height: 4, borderRadius: 2, background: '#eff6ff', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 2, background: 'var(--accent-cyan)', width: `${Math.min(pct, 100)}%`, transition: 'width 0.3s' }} />
                  </div>
                  <p style={{ marginTop: 4, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {mark.marksAwarded}/{mark.maxMarks} marks
                  </p>
                </button>
              )
            })}
            {!filteredMarks.length && (
              <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                No marks entries found
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div style={{ background: '#f8fbff', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '18px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: 12 }}>Selected Record</h2>
          {!selectedMark ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Select a marks entry to view details
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Component', value: selectedMark.component || 'N/A', color: 'var(--accent-cyan)' },
                { label: 'Course', value: courseTitleById.get(selectedMark.courseId) || selectedMark.courseId || 'N/A', color: 'var(--accent-cyan)' },
                { label: 'Marks Awarded', value: `${selectedMark.marksAwarded ?? 'N/A'}`, color: 'var(--accent-cyan)' },
                { label: 'Max Marks', value: `${selectedMark.maxMarks ?? 'N/A'}`, color: 'var(--text-muted)' },
                { label: 'Percentage', value: typeof selectedMark.percentage === 'number' ? `${selectedMark.percentage.toFixed(1)}%` : 'N/A', color: getPercentageColor(selectedMark.percentage) },
                { label: 'Feedback', value: selectedMark.feedback || 'No feedback available', color: 'var(--text-muted)' },
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

export default MarksPage
