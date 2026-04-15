import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { fetchInstructorCourses,} from '../api/instructorApi'
import SummaryCard from '../components/dashboard/SummaryCard'
import SummaryCardSkeleton from '../components/dashboard/SummaryCardSkeleton'
import ErrorState from '../components/dashboard/ErrorState'

function InstructorDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [courses, setCourses] = useState([])
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])

  const norm = (e, fb) => e?.response?.data?.message || fb

  const loadData = useCallback(async () => {
    try {
      const coursesPage = await fetchInstructorCourses({ page: 0, size: 30 })
      const coursesList = coursesPage?.content ?? []
      setCourses(coursesList)
      setAssignments([])
      setSubmissions([])
    } catch (e) {
      setError(norm(e, 'Failed to load dashboard data.'))
    }
  }, [])
  

  useEffect(() => {
    setError('')
    setLoading(true)
    loadData()
      .catch((e) => setError(norm(e, 'Failed to load data.')))
      .finally(() => setLoading(false))
  }, [loadData])

  const stats = useMemo(() => {
    let pendingGrading = 0
    let uniqueStudents = new Set()

    submissions.forEach((s) => {
      if (s.status !== 'GRADED') {
        pendingGrading++
        uniqueStudents.add(s.studentId)
      }
    })

    return {
      courses: courses.length,
      assignments: assignments.length || 0,
      pendingGrading,
      students: uniqueStudents.size,
    }
  }, [courses, assignments, submissions])

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-24 animate-pulse rounded-2xl bg-slate-200/60" />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCardSkeleton />
          <SummaryCardSkeleton />
          <SummaryCardSkeleton />
          <SummaryCardSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => loadData()} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-blue-600">
            Welcome back, {user?.name?.split(' ')[0] || 'Instructor'}
          </h1>
          <p className="mt-2 text-sm text-slate-600">Here's your teaching dashboard. Use the links below to manage your courses, grading, attendance, and materials.</p>
        </div>
      </section>

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="My Courses" value={stats.courses} subtitle="Total courses" accent="cyan" />
        <SummaryCard title="Assignments" value={stats.assignments} subtitle="Across courses" accent="blue" />
        <SummaryCard title="Pending Grading" value={stats.pendingGrading} subtitle="Awaiting review" accent="amber" />
        <SummaryCard title="Students" value={stats.students} subtitle="In submissions queue" accent="violet" />
      </div>

      {/* Navigation Cards */}
      <section>
        <h2 className="text-lg font-bold text-blue-600 mb-4">Quick Access</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* Courses */}
          <button
            onClick={() => navigate('/instructor/courses')}
            className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm hover:shadow-md hover:bg-blue-50 transition flex flex-col gap-3 items-start"
          >
            <div className="text-lg font-bold text-blue-600">COURSES</div>
            <div className="text-left">
              <p className="text-sm font-bold text-blue-600">Manage Courses</p>
              <p className="text-xs text-slate-600 mt-1">View and manage your courses</p>
            </div>
          </button>

          {/* Grading */}
          <button
            onClick={() => navigate('/instructor/grading')}
            className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm hover:shadow-md hover:bg-blue-50 transition flex flex-col gap-3 items-start"
          >
            <div className="text-lg font-bold text-blue-600">GRADING</div>
            <div className="text-left">
              <p className="text-sm font-bold text-blue-600">Grade Submissions</p>
              <p className="text-xs text-slate-600 mt-1">Review and grade student work</p>
            </div>
          </button>

          {/* Attendance */}
          <button
            onClick={() => navigate('/instructor/attendance')}
            className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm hover:shadow-md hover:bg-blue-50 transition flex flex-col gap-3 items-start"
          >
            <div className="text-lg font-bold text-blue-600">ATTENDANCE</div>
            <div className="text-left">
              <p className="text-sm font-bold text-blue-600">Mark Attendance</p>
              <p className="text-xs text-slate-600 mt-1">Track student attendance</p>
            </div>
          </button>

          {/* Materials */}
          <button
            onClick={() => navigate('/instructor/materials')}
            className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm hover:shadow-md hover:bg-blue-50 transition flex flex-col gap-3 items-start"
          >
            <div className="text-lg font-bold text-blue-600">MATERIALS</div>
            <div className="text-left">
              <p className="text-sm font-bold text-blue-600">Manage Materials</p>
              <p className="text-xs text-slate-600 mt-1">Upload course materials</p>
            </div>
          </button>
        </div>
      </section>
    </div>
  ) 
}

export default InstructorDashboardPage
