const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

class ApiError extends Error {
  constructor(message, { status, errors } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

// This module is plain JS, not a component -- it can't call useAuth() or
// useNavigate() itself. AuthProvider registers a callback here on mount
// (see AuthContext.jsx) instead; request() below calls it whenever the
// server says a session isn't valid, regardless of *why* (expired,
// revoked, never logged in). Clearing currentUser is enough on its own --
// AuthenticatedLayout's existing `if (!isLoggedIn) return <Navigate .../>`
// guard handles the actual redirect once isLoggedIn (derived from
// currentUser) goes false, so this never calls navigate() itself.
let unauthorizedHandler = null

function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
  })

  // A 204 (e.g. sign-out) has no body at all - trying to parse it as JSON would throw.
  const data = response.status === 204 ? null : await response.json().catch(() => null)

  if (!response.ok) {
    // 401 specifically, never 403 -- 403 means a real logged-in user just
    // lacks permission for this one action (e.g. a non-org_admin hitting
    // POST /api/v1/facilities), which says nothing about their session
    // being invalid. Only 401 means "the server doesn't consider this
    // session authenticated," which is the one case worth reacting to here.
    if (response.status === 401) {
      unauthorizedHandler?.()
    }

    // Contract: 422s use {"errors": [...]}, everything else uses {"error": "..."}.
    if (data?.errors) {
      throw new ApiError(data.errors[0], { status: response.status, errors: data.errors })
    }
    throw new ApiError(data?.error || 'Something went wrong', { status: response.status })
  }

  return data
}

function get(path) {
  return request(path)
}

function post(path, body) {
  return request(path, { method: 'POST', body: JSON.stringify(body) })
}

function patch(path, body) {
  return request(path, { method: 'PATCH', body: JSON.stringify(body) })
}

function del(path) {
  return request(path, { method: 'DELETE' })
}

export { get, post, patch, del, ApiError, setUnauthorizedHandler }
