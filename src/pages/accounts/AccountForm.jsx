import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ApiError, post } from '../../api/client'
import { useToast } from '../../context/useToast.js'

// Create only -- no PATCH /api/v1/users/:id exists, unlike every other
// *Form.jsx in this app, so there's no edit mode to branch on here.
//
// Also missing: any way to set a new user's facility memberships. Django's
// UserForm has a `facilities` checkbox list (org-scoped), but POST
// /api/v1/users' body only accepts email/password/first_name/last_name/
// role -- no facilities field at all. A doctor/receptionist created
// through this screen will have zero accessible_facilities (org_admin is
// the one role that doesn't need explicit membership -- see brief §4) and
// won't be able to do anything facility-scoped until that's fixed
// server-side. Flagged in CLAUDE.md, not silently worked around.
function AccountForm() {
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'receptionist',
  })
  const [errors, setErrors] = useState([])

  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrors([])

    try {
      const data = await post('/api/v1/users', { user: formData })
      addToast(`Account for ${data.user.email} created successfully.`, 'success')
      navigate('/accounts')
    } catch (err) {
      setErrors(err instanceof ApiError ? err.errors || [err.message] : ['Something went wrong'])
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Account</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
        {errors.length > 0 && (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {errors.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">First name</label>
          <input
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Last name</label>
          <input
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          >
            <option value="org_admin">Org Admin</option>
            <option value="doctor">Doctor</option>
            <option value="receptionist">Receptionist</option>
          </select>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Save
        </button>
      </form>
    </div>
  )
}

export default AccountForm
