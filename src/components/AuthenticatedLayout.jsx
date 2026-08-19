import { Navigate, Outlet, Link } from 'react-router'
import { useAuth } from '../context/useAuth.js'
import LogoutButton from './LogoutButton'

function AuthenticatedLayout() {
  const { isLoggedIn } = useAuth()

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-gray-900">PulseCore</span>
          <Link to="/" className="text-sm text-gray-600 hover:text-blue-600">
            Home
          </Link>
          <Link to="/about" className="text-sm text-gray-600 hover:text-blue-600">
            About
          </Link>
          <Link to="/career" className="text-sm text-gray-600 hover:text-blue-600">
            Career
          </Link>
        </div>
        <LogoutButton />
      </nav>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default AuthenticatedLayout
