import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchStudentCourses, fetchCourseMaterials } from '../api/studentApi'
import ErrorState from '../components/dashboard/ErrorState'
import SummaryCard from '../components/dashboard/SummaryCard'
import SummaryCardSkeleton from '../components/dashboard/SummaryCardSkeleton'
import EmptyState from '../components/dashboard/EmptyState'

function MaterialsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [materials, setMaterials] = useState([])
  const [materialsLoading, setMaterialsLoading] = useState(false)
  const [materialsError, setMaterialsError] = useState('')

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

  const loadMaterials = useCallback(async (courseId) => {
    if (!courseId) {
      setMaterials([])
      return
    }

    setMaterialsError('')
    setMaterialsLoading(true)

    try {
      const response = await fetchCourseMaterials(courseId)
      const materialList = response?.data ?? []
      setMaterials(materialList)
    } catch (loadError) {
      setMaterialsError(loadError?.response?.data?.message || 'Failed to load materials.')
      setMaterials([])
    } finally {
      setMaterialsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCourses()
  }, [loadCourses])

  useEffect(() => {
    if (selectedCourseId) {
      loadMaterials(selectedCourseId)
    }
  }, [selectedCourseId, loadMaterials])

  const selectedCourse = useMemo(
    () => courses.find((course) => course.courseId === selectedCourseId) || null,
    [courses, selectedCourseId]
  )

  const summary = useMemo(
    () => ({
      totalCourses: courses.length,
      activeCourses: courses.filter((course) => String(course.enrollmentStatus).toUpperCase() !== 'DROPPED').length,
      totalMaterials: materials.length,
      courseTitle: selectedCourse?.title || 'Select a course',
    }),
    [courses, materials, selectedCourse]
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
        <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
          <div className="h-96 animate-pulse rounded-2xl bg-slate-200/60" />
          <div className="h-96 animate-pulse rounded-2xl bg-slate-200/60" />
        </div>
      </div>
    )
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadCourses} />
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Study Materials</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-blue-600">Materials Hub</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Access course materials, lecture notes, and study resources shared by your instructors.
          </p>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Total Courses" value={summary.totalCourses} subtitle="Your enrollments" accent="cyan" />
        <SummaryCard
          title="Active Courses"
          value={summary.activeCourses}
          subtitle="Not dropped"
          accent="emerald"
        />
        <SummaryCard title="Materials Found" value={summary.totalMaterials} subtitle="In this course" accent="amber" />
        <SummaryCard title="Current Course" value={summary.courseTitle} subtitle="Viewing materials for" accent="violet" />
      </div>

      <section className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        {/* Materials List */}
        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-blue-600">Course Materials</h3>
          <p className="mt-1 text-sm text-slate-600">PDFs and study resources</p>

          {materialsLoading ? (
            <div className="mt-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-200/60" />
              ))}
            </div>
          ) : materialsError ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{materialsError}</p>
            </div>
          ) : materials.length > 0 ? (
            <div className="mt-4 space-y-3">
              {materials.map((material) => (
                <div key={material.materialId} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{material.title}</h4>
                      <p className="mt-1 text-xs text-slate-600">Uploaded: {new Date(material.createdAt).toLocaleDateString()}</p>
                    </div>
                    <a
                      href={material.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-emerald-300 bg-emerald-500 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                    >
                      📄 View PDF
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState
                title="No materials available"
                description="Your instructor hasn't uploaded any materials for this course yet."
              />
            </div>
          )}
        </div>

        {/* Courses List */}
        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-blue-600">Your Courses</h3>
          <p className="mt-1 text-sm text-slate-600">Select a course to view materials</p>

          {courses.length > 0 ? (
            <div className="mt-4 space-y-2">
              {courses.map((course) => {
                const active = course.courseId === selectedCourseId

                return (
                  <button
                    key={course.courseId}
                    type="button"
                    onClick={() => setSelectedCourseId(course.courseId)}
                    className={`w-full rounded-2xl border p-3 text-left transition ${
                      active
                        ? 'border-blue-300 bg-blue-50 shadow-sm'
                        : 'border-blue-100 bg-white hover:border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900">{course.title}</p>
                    <p className="mt-1 text-xs text-slate-600">
                      Status: {course.enrollmentStatus || 'ENROLLED'}
                    </p>
                  </button>
                )
              })}
            </div>
          ) : (
            <EmptyState title="No courses" description="You are not enrolled in any courses yet." />
          )}
        </div>
      </section>
    </div>
  )
}

export default MaterialsPage
