import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchInstructorCourses } from '../api/instructorApi'
import SummaryCard from '../components/dashboard/SummaryCard'
import SummaryCardSkeleton from '../components/dashboard/SummaryCardSkeleton'
import ErrorState from '../components/dashboard/ErrorState'
import EmptyState from '../components/dashboard/EmptyState'

function InstructorCoursesPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [courses, setCourses] = useState([])
  const [search, setSearch] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState('')

  const loadCourses = useCallback(async () => {
    setError('')
    setLoading(true)

    try {
      const coursesPage = await fetchInstructorCourses({ page: 0, size: 100, sortBy: 'enrolledAt', sortDir: 'desc' })
      const courseList = coursesPage?.content ?? []
      setCourses(courseList)
      setSelectedCourseId((prev) => prev || courseList[0]?.courseId || '')
    } catch (loadError) {
      setError(loadError?.response?.data?.message || 'Failed to load your courses.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCourses()
  }, [loadCourses])

  const filteredCourses = useMemo(() => {
    if (!search.trim()) return courses

    const query = search.trim().toLowerCase()
    return courses.filter((course) => {
      return [course.title, course.description, course.courseId]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    })
  }, [courses, search])

  const selectedCourse = useMemo(() => {
    return filteredCourses.find((course) => course.courseId === selectedCourseId) || filteredCourses[0] || null
  }, [filteredCourses, selectedCourseId])

  const summary = useMemo(
    () => ({
      total: courses.length,
      active: courses.filter((course) => String(course.status).toUpperCase() === 'ACTIVE').length,
      filtered: filteredCourses.length,
    }),
    [courses, filteredCourses]
  )

  const handleRefresh = async () => {
    await loadCourses()
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCardSkeleton />
          <SummaryCardSkeleton />
          <SummaryCardSkeleton />
          <SummaryCardSkeleton />
        </div>
        <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
          <div className="h-96 animate-pulse rounded-2xl bg-slate-200/60" />
          <div className="h-96 animate-pulse rounded-2xl bg-slate-200/60" />
        </div>
      </div>
    )
  }

  if (error) {
    return <ErrorState message={error} onRetry={handleRefresh} />
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">My Courses</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-blue-600">Manage Your Courses</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            View all your courses, manage enrollment, and organize course materials.
          </p>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Total Courses" value={summary.total} subtitle="Courses you teach" accent="cyan" />
        <SummaryCard title="Active Courses" value={summary.active} subtitle="Currently running" accent="emerald" />
        <SummaryCard title="Search Results" value={summary.filtered} subtitle="Matching your query" accent="amber" />
        <SummaryCard
          title="Selected Course"
          value={selectedCourse?.title?.slice(0, 20) || 'None'}
          subtitle="Currently viewing"
          accent="violet"
        />
      </div>

      <section className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="text-lg font-bold text-blue-600">Your Courses</h3>
              <p className="mt-1 text-sm text-slate-600">Browse and manage your courses.</p>
            </div>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title or code"
              className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm text-slate-700 md:max-w-sm"
            />
          </div>

          <div className="mt-4 space-y-3">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => {
                const active = course.courseId === selectedCourseId

                return (
                  <button
                    key={course.courseId}
                    type="button"
                    onClick={() => setSelectedCourseId(course.courseId)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      active ? 'border-blue-300 bg-blue-50 shadow-sm' : 'border-blue-100 bg-white hover:border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{course.title}</p>
                        <p className="mt-1 text-xs text-slate-600">Course ID: {course.courseId}</p>
                      </div>
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-blue-700">
                        {course.status}
                      </span>
                    </div>
                  </button>
                )
              })
            ) : (
              <EmptyState title="No courses found" description="Try adjusting your search or create a new course." />
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-blue-600">Course Details</h3>
          <p className="mt-1 text-sm text-slate-600">Overview of the selected course.</p>

          {selectedCourse ? (
            <div className="mt-4 space-y-3">
              <article className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Title</p>
                <p className="mt-1 text-base font-bold text-slate-900">{selectedCourse.title}</p>
              </article>
              <article className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Description</p>
                <p className="mt-1 text-sm text-slate-700">{selectedCourse.description || 'No description'}</p>
              </article>
              <article className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Status</p>
                <p className="mt-1 text-base font-bold text-slate-900">{selectedCourse.status}</p>
              </article>
              <article className="rounded-2xl border border-blue-100 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Course ID</p>
                <p className="mt-1 text-sm font-mono text-slate-800">{selectedCourse.courseId}</p>
              </article>
            </div>
          ) : (
            <EmptyState title="No course selected" description="Choose a course from the list to see details here." />
          )}
        </div>
      </section>
    </div>
  )
}

export default InstructorCoursesPage
