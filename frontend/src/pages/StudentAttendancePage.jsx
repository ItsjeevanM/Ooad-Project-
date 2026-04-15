import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { fetchStudentAttendance } from '../api/studentApi'
import EmptyState from '../components/dashboard/EmptyState'
import ErrorState from '../components/dashboard/ErrorState'
import SummaryCard from '../components/dashboard/SummaryCard'
import SummaryCardSkeleton from '../components/dashboard/SummaryCardSkeleton'

function StudentAttendancePage() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [attendance, setAttendance] = useState([])
  const [search, setSearch] = useState('')
  const [selectedAttendanceId, setSelectedAttendanceId] = useState('')

  const loadAttendance = useCallback(async () => {
    setError('')
    setLoading(true)

    try {
      const attendancePage = await fetchStudentAttendance({ page: 0, size: 100, sortBy: 'sessionDate', sortDir: 'desc' })
      const attendanceList = attendancePage?.content ?? []
      setAttendance(attendanceList)
      setSelectedAttendanceId((prev) => prev || attendanceList[0]?.attendanceId || '')
    } catch (loadError) {
      setError(loadError?.response?.data?.message || 'Failed to load your attendance record.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadAttendance()
  }, [loadAttendance])

  const filteredAttendance = useMemo(() => {
    if (!search.trim()) return attendance

    const query = search.trim().toLowerCase()
    return attendance.filter((entry) => {
      return [entry.status, entry.courseId, entry.attendanceId, entry.sessionDate]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    })
  }, [attendance, search])

  const selectedAttendance = useMemo(() => {
    return filteredAttendance.find((entry) => entry.attendanceId === selectedAttendanceId) || filteredAttendance[0] || null
  }, [filteredAttendance, selectedAttendanceId])

  const summary = useMemo(() => {
    const present = attendance.filter((entry) => entry.status === 'PRESENT').length
    const late = attendance.filter((entry) => entry.status === 'LATE').length
    const absent = attendance.filter((entry) => entry.status === 'ABSENT').length
    const presentLike = present + late
    const rate = attendance.length ? (presentLike * 100) / attendance.length : 0

    return {
      total: attendance.length,
      present,
      late,
      absent,
      rate,
      filtered: filteredAttendance.length,
    }
  }, [attendance, filteredAttendance])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadAttendance()
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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Attendance Board</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-blue-600">Keep attendance visible and simple</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Review session history, search by status or course, and inspect the latest attendance updates from one clean screen.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/student/dashboard"
              className="rounded-full border border-blue-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
            >
              Back to Dashboard
            </Link>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-full border border-blue-600 bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? 'Refreshing...' : 'Refresh Attendance'}
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Total Sessions" value={summary.total} subtitle="Attendance rows available" accent="violet" />
        <SummaryCard title="Present" value={summary.present} subtitle="Recorded present sessions" accent="emerald" />
        <SummaryCard title="Late" value={summary.late} subtitle="Late arrivals" accent="amber" />
        <SummaryCard title="Attendance Rate" value={`${summary.rate.toFixed(1)}%`} subtitle="Present + late percentage" accent="cyan" />
      </div>

      <section className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="text-lg font-bold text-blue-600">Attendance Sessions</h3>
              <p className="mt-1 text-sm text-slate-600">Search by session date, status, or course.</p>
            </div>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search attendance"
              className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm text-slate-700 md:max-w-sm"
            />
          </div>

          <div className="mt-4 space-y-3">
            {filteredAttendance.slice(0, 10).map((entry) => {
              const active = entry.attendanceId === selectedAttendanceId
              const badgeClasses =
                entry.status === 'PRESENT'
                  ? 'bg-emerald-100 text-emerald-800'
                  : entry.status === 'LATE'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'

              return (
                <button
                  key={entry.attendanceId}
                  type="button"
                  onClick={() => setSelectedAttendanceId(entry.attendanceId)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    active
                      ? 'border-blue-300 bg-blue-50 shadow-sm'
                      : 'border-blue-100 bg-white hover:border-blue-200 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{entry.sessionDate || 'Session date unavailable'}</p>
                      <p className="mt-1 text-xs text-slate-600">Course: {entry.courseId || 'N/A'}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${badgeClasses}`}>
                      {entry.status || 'UNKNOWN'}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-slate-600">Attendance ID: {entry.attendanceId}</p>
                </button>
              )
            })}

            {!filteredAttendance.length && <EmptyState title="No attendance records" description="No sessions match your search." />}
          </div>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-blue-600">Selected Session</h3>
          <p className="mt-1 text-sm text-slate-600">The latest session details in focus.</p>

          {selectedAttendance ? (
            <div className="mt-4 space-y-3">
              <article className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Session Date</p>
                <p className="mt-1 text-base font-bold text-slate-900">{selectedAttendance.sessionDate || 'N/A'}</p>
              </article>
              <article className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Status</p>
                <p className="mt-1 text-base font-bold text-slate-900">{selectedAttendance.status || 'UNKNOWN'}</p>
              </article>
              <article className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Course</p>
                <p className="mt-1 text-base font-bold text-slate-900">{selectedAttendance.courseId || 'N/A'}</p>
              </article>
              <article className="rounded-2xl border border-blue-100 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Attendance Rate</p>
                <p className="mt-1 text-base font-semibold text-slate-800">{summary.rate.toFixed(1)}%</p>
              </article>
            </div>
          ) : (
            <EmptyState title="No session selected" description="Choose a session to inspect the attendance record." />
          )}
        </div>
      </section>
    </div>
  )
}

export default StudentAttendancePage
