import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchInstructorCourses, fetchCourseStudents, markAttendance, getAttendanceFeed } from '../api/instructorApi'
import SummaryCard from '../components/dashboard/SummaryCard'
import SummaryCardSkeleton from '../components/dashboard/SummaryCardSkeleton'
import ErrorState from '../components/dashboard/ErrorState'
import EmptyState from '../components/dashboard/EmptyState'

function InstructorAttendancePage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])
  const [attendanceFeed, setAttendanceFeed] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [attendanceState, setAttendanceState] = useState({})

  const norm = (e, fb) => e?.response?.data?.message || fb

  const loadCourses = useCallback(async () => {
    try {
      const page = await fetchInstructorCourses({ page: 0, size: 30, sortBy: 'enrolledAt', sortDir: 'desc' })
      const list = page?.content ?? []
      setCourses(list)
      setSelectedCourseId((prev) => prev || list[0]?.courseId || '')
    } catch (e) {
      setError(norm(e, 'Failed to load courses'))
    }
  }, [])

  const loadStudents = useCallback(async (courseId) => {
    if (!courseId) {
      setStudents([])
      return
    }
    try {
      const page = await fetchCourseStudents(courseId, { page: 0, size: 50 })
      const list = page?.content ?? []
      setStudents(list)
    } catch (e) {
      setError(norm(e, 'Failed to load students'))
    }
  }, [])

  const loadAttendanceFeed = useCallback(async (courseId) => {
    if (!courseId) {
      setAttendanceFeed([])
      return
    }
    try {
      const feed = await getAttendanceFeed(courseId)
      setAttendanceFeed(feed || [])
    } catch (e) {
      setError(norm(e, 'Failed to load attendance feed'))
    }
  }, [])

  useEffect(() => {
    setError('')
    setLoading(true)
    loadCourses()
      .catch((e) => setError(norm(e, 'Failed to load courses.')))
      .finally(() => setLoading(false))
  }, [loadCourses])

  useEffect(() => {
    if (!selectedCourseId) {
      setStudents([])
      setAttendanceFeed([])
      return
    }
    loadStudents(selectedCourseId)
    loadAttendanceFeed(selectedCourseId)
  }, [selectedCourseId, loadStudents, loadAttendanceFeed])

  const selectedCourse = useMemo(() => courses.find((c) => c.courseId === selectedCourseId), [courses, selectedCourseId])

  const attendanceStats = useMemo(() => {
    const totalStudents = students.length
    const markedToday = students.filter((s) => attendanceState[s.studentId] !== undefined).length
    return { totalStudents, markedToday }
  }, [students, attendanceState])

  const toggleAttendance = useCallback((studentId) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }))
  }, [])

  const handleMarkAttendance = useCallback(async () => {
    setError('')
    const presentStudents = Object.keys(attendanceState).filter((id) => attendanceState[id])
    if (presentStudents.length === 0) {
      setError('Select at least one student as present.')
      return
    }

    try {
      await markAttendance(selectedCourseId, { studentIds: presentStudents })
      setAttendanceState({})
      await loadAttendanceFeed(selectedCourseId)
    } catch (e) {
      setError(norm(e, 'Failed to mark attendance.'))
    }
  }, [selectedCourseId, attendanceState, loadAttendanceFeed])

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCardSkeleton />
          <SummaryCardSkeleton />
          <SummaryCardSkeleton />
          <SummaryCardSkeleton />
        </div>
        <div className="h-96 animate-pulse rounded-2xl bg-slate-200/60" />
      </div>
    )
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => loadCourses()} />
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Attendance</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-blue-600">Mark Attendance</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">Mark student attendance for your courses.</p>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Total Students" value={attendanceStats.totalStudents} subtitle="Enrolled in course" accent="cyan" />
        <SummaryCard title="Marked Today" value={attendanceStats.markedToday} subtitle="Selected as present" accent="amber" />
        <SummaryCard title="Pending" value={attendanceStats.totalStudents - attendanceStats.markedToday} subtitle="Not yet marked" accent="red" />
        <SummaryCard title="Recent" value={attendanceFeed.length} subtitle="Attendance entries" accent="violet" />
      </div>

      <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-blue-600">Select Course</h3>
            <p className="mt-1 text-sm text-slate-600">Choose a course to mark attendance.</p>
          </div>

          <div className="mt-4">
            <label className="block">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-2">Course</p>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-slate-900 font-medium"
              >
                <option value="">-- Choose Course --</option>
                {courses.map((course) => (
                  <option key={course.courseId} value={course.courseId}>
                    {course.title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 space-y-2">
            <p className="text-xs font-semibold uppercase text-blue-600">Course Info</p>
            <p className="text-sm font-semibold text-slate-900">{selectedCourse?.title || 'Select a course'}</p>
            {selectedCourse && (
              <>
                <p className="text-xs text-slate-600">ID: {selectedCourse.courseId}</p>
                <p className="text-xs text-slate-600">Students: {students.length}</p>
              </>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-blue-600">Student Attendance</h3>
            <p className="mt-1 text-sm text-slate-600">Mark students as present. Then click Mark Attendance.</p>
          </div>

          <div className="mt-4 space-y-2">
            {students.length > 0 ? (
              <>
                <div className="max-h-96 space-y-2 overflow-y-auto">
                  {students.map((student) => (
                    <label key={student.studentId} className="flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3 hover:bg-blue-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={attendanceState[student.studentId] || false}
                        onChange={() => toggleAttendance(student.studentId)}
                        className="w-4 h-4 rounded border-blue-300"
                      />
                      <span className="text-sm font-medium text-slate-900">{student.name || student.studentId}</span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={handleMarkAttendance}
                  disabled={Object.values(attendanceState).every((v) => !v)}
                  className="w-full mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Mark Attendance ({Object.values(attendanceState).filter((v) => v).length} selected)
                </button>
              </>
            ) : (
              <EmptyState title="No students" description="Select a course to view enrolled students." />
            )}
          </div>
        </div>
      </section>

      {attendanceFeed.length > 0 && (
        <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-blue-600">Attendance History</h3>
            <p className="mt-1 text-sm text-slate-600">Recent attendance records for this course.</p>
          </div>

          <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
            {attendanceFeed.map((entry, idx) => (
              <div key={idx} className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">{entry.studentId?.slice(0, 12) || 'N/A'}</span>
                  <span className="text-xs text-blue-600 font-semibold">
                    {entry.markedOn ? new Date(entry.markedOn).toLocaleDateString() : 'Today'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default InstructorAttendancePage
