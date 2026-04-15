import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { fetchStudentCourses, fetchAvailableCourses, enrollInCourse } from '../api/studentApi'
import EmptyState from '../components/dashboard/EmptyState'
import ErrorState from '../components/dashboard/ErrorState'
import SummaryCard from '../components/dashboard/SummaryCard'
import SummaryCardSkeleton from '../components/dashboard/SummaryCardSkeleton'

function StudentCoursesPage() {
  const [loading, setLoading] = useState(true)
  const [browsing, setBrowsing] = useState(false)
  const [enrolling, setEnrolling] = useState({})
  const [error, setError] = useState('')
  const [courses, setCourses] = useState([])
  const [availableCourses, setAvailableCourses] = useState([])
  const [browseError, setBrowseError] = useState('')
  const [browseLoading, setBrowseLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState('')

  const loadCourses = useCallback(async () => {
    setError('')
    setLoading(true)

    try {
      const coursesPage = await fetchStudentCourses({ page: 0, size: 100, sortBy: 'enrolledAt', sortDir: 'desc' })
      const courseList = coursesPage?.content ?? []
      setCourses(courseList)
      setSelectedCourseId((prev) => prev || courseList[0]?.courseId || '')
    } catch (loadError) {
      setError(loadError?.response?.data?.message || 'Failed to load your courses.')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadAvailableCourses = useCallback(async () => {
    setBrowseError('')
    setBrowseLoading(true)

    try {
      const response = await fetchAvailableCourses()
      const courseList = response?.data ?? []
      setAvailableCourses(courseList)
    } catch (loadError) {
      setBrowseError(loadError?.response?.data?.message || 'Failed to load available courses.')
    } finally {
      setBrowseLoading(false)
    }
  }, [])

  const handleEnrollCourse = async (courseId) => {
    setEnrolling((prev) => ({ ...prev, [courseId]: true }))
    
    try {
      await enrollInCourse(courseId)
      // Remove from available courses list
      setAvailableCourses((prev) => prev.filter((c) => c.courseId !== courseId))
      // Refresh enrolled courses
      await loadCourses()
    } catch (enrollError) {
      setBrowseError(enrollError?.response?.data?.message || 'Failed to enroll in course.')
    } finally {
      setEnrolling((prev) => ({ ...prev, [courseId]: false }))
    }
  }

  const toggleBrowsing = async () => {
    if (!browsing) {
      await loadAvailableCourses()
    }
    setBrowsing(!browsing)
  }

  useEffect(() => {
    loadCourses()
  }, [loadCourses])

  const filteredCourses = useMemo(() => {
    if (!search.trim()) return courses

    const query = search.trim().toLowerCase()
    return courses.filter((course) => {
      return [course.title, course.subjectCode, course.enrollmentStatus, course.courseId]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    })
  }, [courses, search])

  const selectedCourse = useMemo(() => {
    return filteredCourses.find((course) => course.courseId === selectedCourseId) || filteredCourses[0] || null
  }, [filteredCourses, selectedCourseId])

  const summary = useMemo(() => {
    const activeCount = courses.filter((course) => String(course.enrollmentStatus).toUpperCase() !== 'DROPPED').length
    return {
      total: courses.length,
      active: activeCount,
      filtered: filteredCourses.length,
      latest: courses[0]?.enrolledAt || null,
    }
  }, [courses, filteredCourses])

  const handleRefresh = async () => {
    //setRefreshing(true)
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

  if (browsing) {
    return (
      <div className="space-y-6">
        <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Browse Courses</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-blue-600">Available courses for enrollment</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Explore all active courses and enroll in ones that match your interests.
              </p>
            </div>
            <button
              onClick={toggleBrowsing}
              className="rounded-xl border border-blue-300 bg-white px-4 py-2 font-semibold text-blue-600 hover:bg-blue-50"
            >
              Back to My Courses
            </button>
          </div>
        </section>

        {browseError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{browseError}</p>
          </div>
        )}

        {browseLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-200/60" />
            ))}
          </div>
        ) : availableCourses.length > 0 ? (
          <div className="grid gap-4">
            {availableCourses.map((course) => (
              <div key={course.courseId} className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900">{course.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{course.description || 'No description provided'}</p>
                    <p className="mt-2 text-xs text-slate-500">Course ID: {course.courseId}</p>
                  </div>
                  <button
                    onClick={() => handleEnrollCourse(course.courseId)}
                    disabled={enrolling[course.courseId]}
                    className="rounded-xl border border-emerald-300 bg-emerald-500 px-4 py-2 font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
                  >
                    {enrolling[course.courseId] ? 'Enrolling...' : 'Enroll'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No available courses" description="All active courses have already been enrolled. Check back later for new courses!" />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Course Hub</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-blue-600">All enrolled courses in one place</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Browse active classes, verify enrollment status, and jump back to the dashboard whenever you need the overview.
            </p>
          </div>
          <button
            onClick={toggleBrowsing}
            className="rounded-xl border border-blue-300 bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600"
          >
            + Browse Courses
          </button>
        </div>
      </section>


      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Total Courses" value={summary.total} subtitle="Current enrollments" accent="cyan" />
        <SummaryCard title="Active Courses" value={summary.active} subtitle="Not dropped or withdrawn" accent="emerald" />
        <SummaryCard title="Filtered Results" value={summary.filtered} subtitle="Search matches" accent="amber" />
        <SummaryCard
          title="Latest Enrollment"
          value={summary.latest ? new Date(summary.latest).toLocaleDateString() : 'N/A'}
          subtitle="Most recent course activity"
          accent="violet"
        />
      </div>

      <section className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="text-lg font-bold text-blue-600">Enrolled Courses</h3>
              <p className="mt-1 text-sm text-slate-600">Pick a course to inspect its enrollment details.</p>
            </div>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search course, code, or status"
              className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm text-slate-700 md:max-w-sm"
            />
          </div>

          <div className="mt-4 space-y-3">
            {filteredCourses.slice(0, 10).map((course) => {
              const active = course.courseId === selectedCourseId

              return (
                <button
                  key={course.enrollmentId || course.courseId}
                  type="button"
                  onClick={() => setSelectedCourseId(course.courseId)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    active
                      ? 'border-blue-300 bg-blue-50 shadow-sm'
                      : 'border-blue-100 bg-white hover:border-blue-200 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{course.title}</p>
                      <p className="mt-1 text-xs text-slate-600">Course ID: {course.courseId}</p>
                    </div>
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-blue-700">
                      {course.subjectCode || 'Course'}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <span className="rounded-full bg-white px-2 py-1 font-medium text-slate-700">{course.enrollmentStatus || 'ENROLLED'}</span>
                    <span>Enrolled: {course.enrolledAt ? new Date(course.enrolledAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </button>
              )
            })}

            {!filteredCourses.length && (
              <EmptyState title="No matching courses" description="Try a different search term or clear the filter." />
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-blue-600">Course Details</h3>
          <p className="mt-1 text-sm text-slate-600">A quick snapshot of the selected course.</p>

          {selectedCourse ? (
            <div className="mt-4 space-y-3">
              <article className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Title</p>
                <p className="mt-1 text-base font-bold text-slate-900">{selectedCourse.title}</p>
              </article>
              <article className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Subject Code</p>
                <p className="mt-1 text-base font-bold text-slate-900">{selectedCourse.subjectCode || 'N/A'}</p>
              </article>
              <article className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Enrollment Status</p>
                <p className="mt-1 text-base font-bold text-slate-900">{selectedCourse.enrollmentStatus || 'ENROLLED'}</p>
              </article>
              <article className="rounded-2xl border border-blue-100 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Enrolled At</p>
                <p className="mt-1 text-base font-semibold text-slate-800">
                  {selectedCourse.enrolledAt ? new Date(selectedCourse.enrolledAt).toLocaleString() : 'N/A'}
                </p>
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

export default StudentCoursesPage
