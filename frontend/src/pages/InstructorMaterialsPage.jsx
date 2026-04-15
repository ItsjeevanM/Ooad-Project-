import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchInstructorCourses, uploadMaterial, fetchInstructorMaterials } from '../api/instructorApi'
import SummaryCard from '../components/dashboard/SummaryCard'
import SummaryCardSkeleton from '../components/dashboard/SummaryCardSkeleton'
import ErrorState from '../components/dashboard/ErrorState'
import EmptyState from '../components/dashboard/EmptyState'

function InstructorMaterialsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [courses, setCourses] = useState([])
  const [materials, setMaterials] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [uploadingMaterial, setUploadingMaterial] = useState(false)
  const [materialUploadError, setMaterialUploadError] = useState('')
  const [materialUploadSuccess, setMaterialUploadSuccess] = useState('')
  const [materialFile, setMaterialFile] = useState(null)

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

  const loadMaterials = useCallback(async (courseId) => {
    if (!courseId) {
      setMaterials([])
      return
    }
    try {
      const mats = await fetchInstructorMaterials(courseId)
      setMaterials(mats || [])
    } catch (e) {
      setError(norm(e, 'Failed to load materials'))
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
      setMaterials([])
      return
    }
    loadMaterials(selectedCourseId)
  }, [selectedCourseId, loadMaterials])

  const selectedCourse = useMemo(() => courses.find((c) => c.courseId === selectedCourseId), [courses, selectedCourseId])

  const handleUploadMaterial = useCallback(async () => {
    setMaterialUploadError('')
    setMaterialUploadSuccess('')

    if (!selectedCourseId) {
      setMaterialUploadError('Please select a course.')
      return
    }

    if (!materialFile) {
      setMaterialUploadError('Please select a PDF file.')
      return
    }

    if (materialFile.type !== 'application/pdf') {
      setMaterialUploadError('Only PDF files are allowed.')
      return
    }

    setUploadingMaterial(true)
    try {
      await uploadMaterial(selectedCourseId, materialFile)
      setMaterialUploadSuccess('Material uploaded successfully!')
      setMaterialFile(null)
      await loadMaterials(selectedCourseId)
      setTimeout(() => setMaterialUploadSuccess(''), 3000)
    } catch (e) {
      setMaterialUploadError(norm(e, 'Failed to upload material.'))
    } finally {
      setUploadingMaterial(false)
    }
  }, [selectedCourseId, materialFile, loadMaterials])

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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Materials</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-blue-600">Manage Course Materials</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">Upload and manage PDF materials for your courses.</p>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Total Courses" value={courses.length} subtitle="Your courses" accent="cyan" />
        <SummaryCard title="Selected Course" value={selectedCourse?.title?.slice(0, 15) || 'N/A'} subtitle="Current course" accent="blue" />
        <SummaryCard title="Materials" value={materials.length} subtitle="Uploaded for course" accent="emerald" />
        <SummaryCard title="Total Materials" value={courses.reduce((acc, c) => acc + (c.materialCount || 0), 0)} subtitle="All courses" accent="purple" />
      </div>

      <section className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-blue-600">Upload Material</h3>
            <p className="mt-1 text-sm text-slate-600">Add PDF files to your course.</p>
          </div>

          <div className="mt-6 space-y-4">
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
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-2">PDF File</p>
                <div className="relative">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setMaterialFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="material-file-input"
                  />
                  <label
                    htmlFor="material-file-input"
                    className="block w-full rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 p-4 text-center cursor-pointer hover:bg-blue-100 transition"
                  >
                    {materialFile ? (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-blue-600">{materialFile.name}</p>
                        <p className="text-xs text-slate-600">{(materialFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-blue-600">Choose PDF or drag here</p>
                        <p className="text-xs text-slate-600">Max 10 MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </label>
            </div>

            {materialUploadError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{materialUploadError}</div>}
            {materialUploadSuccess && <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{materialUploadSuccess}</div>}

            <button
              onClick={handleUploadMaterial}
              disabled={uploadingMaterial || !selectedCourseId || !materialFile}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {uploadingMaterial ? 'Uploading...' : 'Upload Material'}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-blue-600">Course Materials</h3>
            <p className="mt-1 text-sm text-slate-600">Materials uploaded for {selectedCourse?.title || 'this course'}</p>
          </div>

          <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
            {materials.length > 0 ? (
              materials.map((material) => (
                <a
                  key={material.materialId}
                  href={`/api/v1/files/${material.filename}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border border-blue-200 bg-blue-50 p-3 hover:bg-blue-100 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 flex-shrink-0">PDF</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{material.filename}</p>
                      <p className="text-xs text-slate-600 mt-1">
                        Uploaded: {material.uploadedAt ? new Date(material.uploadedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </a>
              ))
            ) : (
              <EmptyState title="No materials" description={selectedCourse ? 'Upload materials to this course.' : 'Select a course first.'} />
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default InstructorMaterialsPage
