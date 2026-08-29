import { Navigate, Outlet, Link } from 'react-router'
import { useAuth } from '../context/useAuth.js'
import LogoutButton from './LogoutButton'

function AuthenticatedLayout() {
  const { isLoggedIn, currentUser, currentFacility, accessibleFacilities, setCurrentFacility } =
    useAuth()

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-6">
          {/* The brand text itself is the home link, matching the Django
              reference -- not a separate "Home" nav item. */}
          <Link to="/" className="font-bold text-gray-900">
            PulseCore
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/appointments" className="text-gray-700 hover:text-blue-600">
              Appointments
            </Link>
            <Link to="/patients" className="text-gray-700 hover:text-blue-600">
              Patients
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {accessibleFacilities.length > 1 ? (
            <div className="flex items-center gap-1.5 bg-gray-100 rounded px-2 py-1">
              <span className="text-gray-500">Facility:</span>
              <select
                value={currentFacility?.id || ''}
                onChange={(event) => {
                  const facility = accessibleFacilities.find((f) => f.id === event.target.value)
                  setCurrentFacility(facility)
                }}
                className="bg-transparent border-0 py-0 pr-6 text-gray-900 font-medium focus:ring-0 cursor-pointer"
              >
                {accessibleFacilities.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            currentFacility && (
              <span className="bg-gray-100 rounded px-2 py-1">
                <span className="text-gray-500">Facility:</span>{' '}
                <span className="text-gray-900 font-medium">{currentFacility.name}</span>
              </span>
            )
          )}
          <span className="text-gray-500">{currentUser?.email}</span>
          <LogoutButton />
        </div>
      </nav>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default AuthenticatedLayout
