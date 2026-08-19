import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../context/useAuth.js'

function RequireFacility() {
  const { currentFacility } = useAuth()
  const location = useLocation()

  if (!currentFacility) {
    return (
      <Navigate
        to={`/choose-facility?next=${encodeURIComponent(location.pathname)}`}
        replace
      />
    )
  }

  return <Outlet />
}

export default RequireFacility
