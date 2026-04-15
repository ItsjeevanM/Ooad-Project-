import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { fetchInstructorCourses, fetchInstructorAssignments, fetchInstructorSubmissions, gradeInstructorSubmission } from '../api/instructorApi'
import SummaryCard from '../components/dashboard/SummaryCard'
import SummaryCardSkeleton from '../components/dashboard/SummaryCardSkeleton'
import ErrorState from '../components/dashboard/ErrorState'
import EmptyState from '../components/dashboard/EmptyState'

function InstructorGradingPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [courses, setCourses] = useState([])
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('')
  const [submissionSearch, setSubmissionSearch] = useState('')
  const [gradingState, setGradingState] = useState({})

  const assignmentCache = useRef(new Map())
  const submissionCache = useRef(new Map())
  const norm = (e, fb) => e?.response?.data?.message || fb

  const loadCourses = useCallback(async () => {
    const page = await fetchInstructorCourses({ page: 0, size: 30, sortBy: 'enrolledAt', sortDir: 'desc' })
    const list = page?.content ?? []
    setCourses(list)
    setSelectedCourseId((prev) => prev || list[0]?.courseId || '')
  }, [])

  const loadAssignments = useCallback(async (courseId, force = false) => {
    if (!courseId) {
      setAssignments([])
      setSelectedAssignmentId('')
      return
    }
    const key = String(courseId)
    const cached = assignmentCache.current.get(key)
    if (cached && !force) {
      setAssignments(cached)
      setSelectedAssignmentId((p) => p || cached[0]?.assignmentId || '')
    }
    try {
      const page = await fetchInstructorAssignments(courseId, { page: 0, size: 50, sortBy: 'deadline', sortDir: 'asc' })
      const list = page?.content ?? []
      assignmentCache.current.set(key, list)
      setAssignments(list)
      setSelectedAssignmentId((p) => {
        if (p && list.some((a) => a.assignmentId === p)) return p
        return list[0]?.assignmentId || ''
      })
    } catch (e) {
      setError(norm(e, 'Failed to load assignments'))
    }
  }, [])

  const loadSubmissions = useCallback(async (assignmentId, force = false) => {
    if (!assignmentId) {
      setSubmissions([])
      return
    }
    const key = String(assignmentId)
    const cached = submissionCache.current.get(key)
    if (cached && !force) {
      setSubmissions(cached)
      return
    }
    try {
      const page = await fetchInstructorSubmissions(assignmentId, { page: 0, size: 100, sortBy: 'submittedAt', sortDir: 'desc' })
      const list = page?.content ?? []
      submissionCache.current.set(key, list)
      setSubmissions(list)
    } catch (e) {
      setError(norm(e, 'Failed to load submissions'))
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
      setAssignments([])
      setSelectedAssignmentId('')
      return
    }
    loadAssignments(selectedCourseId).catch((e) => setError(norm(e, 'Failed to load assignments.')))
  }, [selectedCourseId, loadAssignments])

  useEffect(() => {
    if (!selectedAssignmentId) {
      setSubmissions([])
      return
    }
    loadSubmissions(selectedAssignmentId).catch((e) => setError(norm(e, 'Failed to load submissions.')))
  }, [selectedAssignmentId, loadSubmissions])

  const selectedCourse = useMemo(() => courses.find((c) => c.courseId === selectedCourseId) || null, [courses, selectedCourseId])
  const selectedAssignment = useMemo(() => assignments.find((a) => a.assignmentId === selectedAssignmentId) || null, [assignments, selectedAssignmentId])

  const pendingSubmissions = useMemo(() => submissions.filter((s) => s.status !== 'GRADED'), [submissions])
  const filteredSubmissions = useMemo(() => {
    const q = submissionSearch.trim().toLowerCase()
    if (!q) return submissions
    return submissions.filter((s) => [s.submissionId, s.studentId, s.status].some((v) => String(v).toLowerCase().includes(q)))
  }, [submissions, submissionSearch])

  const quickGrade = useCallback(
    async (submissionId, maxMarks) => {
      setGradingState((p) => ({ ...p, [submissionId]: true }))
      setError('')
      try {
        const graded = await gradeInstructorSubmission(submissionId, { marksAwarded: maxMarks, feedback: 'Quick-graded from dashboard' })
        setSubmissions((p) => p.map((s) => (s.submissionId === submissionId ? graded : s)))
      } catch (e) {
        setError(norm(e, 'Grading failed.'))
      } finally {
        setGradingState((p) => ({ ...p, [submissionId]: false }))
      }
    },
    []
  )

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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Grading</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-blue-600">Grade Submissions</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">Review and grade student submissions for your assignments.</p>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Total Submissions" value={submissions.length} subtitle="In this assignment" accent="cyan" />
        <SummaryCard title="Pending Grading" value={pendingSubmissions.length} subtitle="Awaiting review" accent="amber" />
        <SummaryCard title="Graded" value={submissions.length - pendingSubmissions.length} subtitle="Completed" accent="emerald" />
        <SummaryCard
          title="Max Marks"
          value={selectedAssignment?.maxMarks ?? 'N/A'}
          subtitle="For this assignment"
          accent="violet"
        />
      </div>

      <section className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-blue-600">Select Assignment</h3>
            <p className="mt-1 text-sm text-slate-600">Choose course and assignment to grade.</p>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-2">Select Course</p>
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

            <div>
              <label className="block">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-2">Select Assignment</p>
                <select
                  value={selectedAssignmentId}
                  onChange={(e) => setSelectedAssignmentId(e.target.value)}
                  className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-slate-900 font-medium"
                >
                  <option value="">-- Choose Assignment --</option>
                  {assignments.map((assignment) => (
                    <option key={assignment.assignmentId} value={assignment.assignmentId}>
                      {assignment.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {selectedAssignment && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 space-y-2">
                <p className="text-xs font-semibold uppercase text-blue-600">Assignment Info</p>
                <p className="text-sm font-semibold text-slate-900">{selectedAssignment.title}</p>
                <p className="text-xs text-slate-600">Max Marks: {selectedAssignment.maxMarks}</p>
                <p className="text-xs text-slate-600">
                  Deadline: {new Date(selectedAssignment.deadline).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-bold text-blue-600">Submissions</h3>
              <p className="mt-1 text-sm text-slate-600">Grade student submissions</p>
            </div>
            <input
              type="text"
              value={submissionSearch}
              onChange={(e) => setSubmissionSearch(e.target.value)}
              placeholder="Search by ID or status"
              className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-slate-700 md:max-w-xs"
            />
          </div>

          <div className="mt-4 space-y-3">
            {filteredSubmissions.length > 0 ? (
              filteredSubmissions.map((submission) => (
                <div key={submission.submissionId} className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Student: {submission.studentId.slice(0, 8)}...</p>
                      <p className="mt-1 text-xs text-slate-600">Status: {submission.status}</p>
                    </div>
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700">{submission.status}</span>
                  </div>
                  {submission.status !== 'GRADED' && (
                    <button
                      onClick={() => quickGrade(submission.submissionId, selectedAssignment?.maxMarks ?? 100)}
                      disabled={!!gradingState[submission.submissionId]}
                      className="w-full rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-600 disabled:opacity-50"
                    >
                      {gradingState[submission.submissionId] ? 'Grading...' : `Quick Grade (${selectedAssignment?.maxMarks ?? 100} pts)`}
                    </button>
                  )}
                </div>
              ))
            ) : (
              <EmptyState title="No submissions" description="Select an assignment to view submissions." />
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default InstructorGradingPage
