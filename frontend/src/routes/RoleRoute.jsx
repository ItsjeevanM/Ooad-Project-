import { Navigate, Outlet } from 'react-router-dom'

import { useAuthStore } from '../store/authStore'

function RoleRoute({ allowedRoles }) {
  const user = useAuthStore((state) => state.user)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'INSTRUCTOR') {
      return <Navigate to="/instructor/dashboard" replace />
    }

    if (user.role === 'STUDENT') {
      return <Navigate to="/student/dashboard" replace />
    }

    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default RoleRoute
