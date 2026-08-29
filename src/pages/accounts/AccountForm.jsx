import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { ApiError, get, patch, post } from '../../api/client'
import { useToast } from '../../context/useToast.js'

// Shared create/edit, same router-state pattern as every other *Form.jsx
// (no GET /api/v1/users/:id, only the org-wide index -- AccountList's edit
// <Link state={{ account }}> carries the record in).
//
// Edit is deliberately narrower than create: PATCH /api/v1/users/:id only
// accepts first_name/last_name/role/facility_ids -- email is the login
// identifier and password goes through the reset flow, neither editable
// here. Shown read-only in edit mode rather than omitted, so the admin can
// still see which account they're on.
//
// facility_ids (added 2026-08-29, closing the gap this file used to flag)
// is a real behavioral nuance, not just "send an array": assigning exactly
// one auto-sets that as the user's default_facility; zero or several
// leaves it unset (they pick on login). On edit specifically, the key is
// only touched when present -- since this form always renders/submits the
// checkbox list once loaded, that's a non-issue here, but worth knowing if
// this endpoint is ever called from somewhere that omits the field on
// purpose.
function AccountForm() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { addToast } = useToast()

  const isEditing = Boolean(id)
  const existingAccount = location.state?.account

  const [facilities, setFacilities] = useState([])
  const [formData, setFormData] = useState({
    email: existingAccount?.email || '',
    password: '',
    first_name: existingAccount?.first_name || '',
    last_name: existingAccount?.last_name || '',
    role: existingAccount?.role || 'receptionist',
    facility_ids: existingAccount?.facility_ids || [],
  })
  const [errors, setErrors] = useState([])

  useEffect(() => {
    async function loadFacilities() {
      try {
        const data = await get('/api/v1/facilities')
        setFacilities(data.facilities)
      } catch {
        // A 401 is already handled globally; any other failure just leaves
        // the checkbox list empty rather than crashing the form.
      }
    }
    loadFacilities()
  }, [])

  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value })
  }

  function toggleFacility(facilityId) {
    setFormData((previous) => ({
      ...previous,
      facility_ids: previous.facility_ids.includes(facilityId)
        ? previous.facility_ids.filter((id) => id !== facilityId)
        : [...previous.facility_ids, facilityId],
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrors([])

    const body = isEditing
      ? {
          user: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            role: formData.role,
            facility_ids: formData.facility_ids,
          },
        }
      : { user: formData }

    try {
      const data = isEditing
        ? await patch(`/api/v1/users/${id}`, body)
        : await post('/api/v1/users', body)

      addToast(
        isEditing
          ? `Account for ${data.user.email} updated.`
          : `Account for ${data.user.email} created successfully.`,
        'success',
      )
      navigate('/accounts')
    } catch (err) {
      setErrors(err instanceof ApiError ? err.errors || [err.message] : ['Something went wrong'])
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEditing ? 'Edit' : 'Add'} Account</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
        {errors.length > 0 && (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {errors.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </div>
        )}
        {isEditing ? (
          <div>
            <span className="block text-sm font-medium text-gray-700">Email</span>
            <p className="mt-1 text-gray-900">{formData.email}</p>
          </div>
        ) : (
          <>
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
          </>
        )}
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
        <div>
          <span className="block text-sm font-medium text-gray-700 mb-1">Facilities</span>
          <div className="space-y-1">
            {facilities.map((facility) => (
              <label key={facility.id} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.facility_ids.includes(facility.id)}
                  onChange={() => toggleFacility(facility.id)}
                />
                {facility.name}
              </label>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Assigning exactly one facility sets it as this user&rsquo;s default.
          </p>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Save
        </button>
      </form>
    </div>
  )
}

export default AccountForm
