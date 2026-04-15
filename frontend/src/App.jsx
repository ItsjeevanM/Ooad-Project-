import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import AppShell from './layouts/AppShell'
import AuthInitSkeleton from './components/AuthInitSkeleton'
import InstructorDashboardPage from './pages/InstructorDashboardPage'
import InstructorCoursesPage from './pages/InstructorCoursesPage'
import InstructorGradingPage from './pages/InstructorGradingPage'
import InstructorAttendancePage from './pages/InstructorAttendancePage'
import InstructorMaterialsPage from './pages/InstructorMaterialsPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import StudentDashboardPage from './pages/StudentDashboardPage'
import CoursesPage from './pages/student/CoursesPage'
import MarksPage from './pages/student/MarksPage'
import AttendancePage from './pages/student/AttendancePage'
import MaterialsPage from './pages/MaterialsPage'
import ProtectedRoute from './routes/ProtectedRoute'
import RoleRoute from './routes/RoleRoute'
import { useAuthStore } from './store/authStore'

function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    user: state.user,
  }))

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (user.role === 'INSTRUCTOR') {
    return <Navigate to="/instructor/dashboard" replace />
  }

  if (user.role === 'STUDENT') {
    return <Navigate to="/student/dashboard" replace />
  }

  return <Navigate to="/login" replace />
}

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth)
  const isInitializing = useAuthStore((state) => state.isInitializing)

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  if (isInitializing) {
    return <AuthInitSkeleton />
  }

  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={['STUDENT']} />}>
          <Route
            path="/student/dashboard"
            element={
              <AppShell title="Student Dashboard" subtitle="Track courses, assignments, marks, and attendance.">
                <StudentDashboardPage />
              </AppShell>
            }
          />
          <Route
            path="/student/courses"
            element={
              <AppShell title="Courses" subtitle="Browse enrolled courses and course status.">
                <CoursesPage />
              </AppShell>
            }
          />
          <Route
            path="/student/marks"
            element={
              <AppShell title="Marks Sheet" subtitle="Review your latest scores and grading progress.">
                <MarksPage />
              </AppShell>
            }
          />
          <Route
            path="/student/attendance"
            element={
              <AppShell title="Attendance" subtitle="Inspect attendance sessions and status history.">
                <AttendancePage />
              </AppShell>
            }
          />
          <Route
            path="/student/materials"
            element={
              <AppShell title="Materials" subtitle="Access course materials and study resources.">
                <MaterialsPage />
              </AppShell>
            }
          />
        </Route>

        <Route element={<RoleRoute allowedRoles={['INSTRUCTOR']} />}>
          <Route
            path="/instructor/dashboard"
            element={
              <AppShell title="Instructor Dashboard" subtitle="Manage courses, assignments, grading, and attendance.">
                <InstructorDashboardPage />
              </AppShell>
            }
          />
          <Route
            path="/instructor/courses"
            element={
              <AppShell title="Manage Courses" subtitle="View and manage your courses.">
                <InstructorCoursesPage />
              </AppShell>
            }
          />
          <Route
            path="/instructor/grading"
            element={
              <AppShell title="Grade Submissions" subtitle="Review and grade student work.">
                <InstructorGradingPage />
              </AppShell>
            }
          />
          <Route
            path="/instructor/attendance"
            element={
              <AppShell title="Mark Attendance" subtitle="Track student attendance.">
                <InstructorAttendancePage />
              </AppShell>
            }
          />
          <Route
            path="/instructor/materials"
            element={
              <AppShell title="Manage Materials" subtitle="Upload and manage course materials.">
                <InstructorMaterialsPage />
              </AppShell>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
