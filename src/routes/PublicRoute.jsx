import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Prevents an already-authenticated user from seeing /login or /register.
export default function PublicRoute() {
  const { isAuthenticated, isInitializing } = useAuth()

  if (isInitializing) return null
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  return <Outlet />
}
