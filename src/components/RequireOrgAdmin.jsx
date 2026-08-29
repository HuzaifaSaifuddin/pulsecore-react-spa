import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../context/useAuth.js'

// Client-side courtesy only -- the real boundary is server-side (403 on
// POST/PATCH /api/v1/facilities and POST /api/v1/users for a non-org_admin,
// confirmed in the Rails contract). This just avoids showing a create/edit
// form that would only ever fail on submit for the wrong role.
function RequireOrgAdmin() {
  const { currentUser } = useAuth()

  if (currentUser?.role !== 'org_admin') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default RequireOrgAdmin
