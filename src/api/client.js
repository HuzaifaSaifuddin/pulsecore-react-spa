const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

class ApiError extends Error {
  constructor(message, { status, errors } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
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

export { get, post, patch, del, ApiError }
