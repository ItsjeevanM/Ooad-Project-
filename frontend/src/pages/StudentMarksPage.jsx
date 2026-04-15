import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { fetchStudentMarks } from '../api/studentApi'
import EmptyState from '../components/dashboard/EmptyState'
import ErrorState from '../components/dashboard/ErrorState'
import SummaryCard from '../components/dashboard/SummaryCard'
import SummaryCardSkeleton from '../components/dashboard/SummaryCardSkeleton'

function StudentMarksPage() {
  const [loading, setLoading] = useState(true)
  //const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [marks, setMarks] = useState([])
  const [search, setSearch] = useState('')
  const [selectedMarkId, setSelectedMarkId] = useState('')

  const loadMarks = useCallback(async () => {
    setError('')
    setLoading(true)

    try {
      const marksPage = await fetchStudentMarks({ page: 0, size: 100, sortBy: 'enrolledAt', sortDir: 'desc' })
      const markList = marksPage?.content ?? []
      setMarks(markList)
      setSelectedMarkId((prev) => prev || markList[0]?.marksId || '')
    } catch (loadError) {
      setError(loadError?.response?.data?.message || 'Failed to load your marks sheet.')
    } finally {
      setLoading(false)
      //setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadMarks()
  }, [loadMarks])

  const filteredMarks = useMemo(() => {
    if (!search.trim()) return marks

    const query = search.trim().toLowerCase()
    return marks.filter((mark) => {
      return [mark.component, mark.courseId, mark.marksId, mark.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    })
  }, [marks, search])

  const selectedMark = useMemo(() => {
    return filteredMarks.find((mark) => mark.marksId === selectedMarkId) || filteredMarks[0] || null
  }, [filteredMarks, selectedMarkId])

  const summary = useMemo(() => {
    const percentages = marks.map((mark) => mark.percentage).filter((value) => typeof value === 'number')
    const average = percentages.length ? percentages.reduce((sum, value) => sum + value, 0) / percentages.length : 0
    const highest = percentages.length ? Math.max(...percentages) : 0
    const gradedCount = marks.length
    const passedCount = marks.filter((mark) => typeof mark.percentage === 'number' && mark.percentage >= 40).length

    return {
      total: marks.length,
      gradedCount,
      average,
      highest,
      passedCount,
      filtered: filteredMarks.length,
    }
  }, [marks, filteredMarks])

  const handleRefresh = async () => {
    //setRefreshing(true)
    await loadMarks()
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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Marks Sheet</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-blue-600">Track scores and grading trends</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Review the latest marks, compare performance across components, and keep the grade picture visible without opening every course.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
          </div>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="All Records" value={summary.total} subtitle="Mark entries available" accent="emerald" />
        <SummaryCard title="Graded Items" value={summary.gradedCount} subtitle="Completed assessments" accent="cyan" />
        <SummaryCard title="Average Score" value={`${summary.average.toFixed(1)}%`} subtitle="Overall performance" accent="violet" />
        <SummaryCard title="Highest Score" value={`${summary.highest.toFixed(1)}%`} subtitle="Best recorded result" accent="amber" />
      </div>

      <section className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="text-lg font-bold text-blue-600">Marks Entries</h3>
              <p className="mt-1 text-sm text-slate-600">Search by component, course, or status.</p>
            </div>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search marks"
              className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm text-slate-700 md:max-w-sm"
            />
          </div>

          <div className="mt-4 space-y-3">
            {filteredMarks.slice(0, 10).map((mark) => {
              const active = mark.marksId === selectedMarkId
              const percentage = typeof mark.percentage === 'number' ? mark.percentage : 0

              return (
                <button
                  key={mark.marksId}
                  type="button"
                  onClick={() => setSelectedMarkId(mark.marksId)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    active
                      ? 'border-blue-300 bg-blue-50 shadow-sm'
                      : 'border-blue-100 bg-white hover:border-blue-200 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{mark.component || 'Assessment'}</p>
                      <p className="mt-1 text-xs text-slate-600">Course: {mark.courseId || 'N/A'}</p>
                    </div>
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-blue-700">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-100">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(percentage, 100)}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-slate-600">
                    {mark.marksAwarded}/{mark.maxMarks} marks
                  </p>
                </button>
              )
            })}

            {!filteredMarks.length && <EmptyState title="No matching marks" description="Try a different search term." />}
          </div>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-blue-600">Selected Record</h3>
          <p className="mt-1 text-sm text-slate-600">Detailed view of the current marks entry.</p>

          {selectedMark ? (
            <div className="mt-4 space-y-3">
              <article className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Component</p>
                <p className="mt-1 text-base font-bold text-slate-900">{selectedMark.component || 'Assessment'}</p>
              </article>
              <article className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Score</p>
                <p className="mt-1 text-base font-bold text-slate-900">
                  {selectedMark.marksAwarded}/{selectedMark.maxMarks}
                </p>
              </article>
              <article className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Percentage</p>
                <p className="mt-1 text-base font-bold text-slate-900">
                  {typeof selectedMark.percentage === 'number' ? `${selectedMark.percentage.toFixed(1)}%` : 'N/A'}
                </p>
              </article>
              <article className="rounded-2xl border border-blue-100 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Course</p>
                <p className="mt-1 text-base font-semibold text-slate-800">{selectedMark.courseId || 'N/A'}</p>
              </article>
            </div>
          ) : (
            <EmptyState title="No mark selected" description="Choose a row to inspect the score details." />
          )}
        </div>
      </section>
    </div>
  )
}

export default StudentMarksPage
