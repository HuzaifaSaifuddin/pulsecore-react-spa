import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { ApiError, patch, post } from '../../api/client'
import { useToast } from '../../context/useToast.js'

// Shared create/edit, same shape as PatientForm -- edit reads the record
// from router state (set by FacilityList's edit <Link state={{ facility }}>)
// since there's no GET /api/v1/facilities/:id, only the org-wide index.
function FacilityForm() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { addToast } = useToast()

  const isEditing = Boolean(id)
  const existingFacility = location.state?.facility

  const [name, setName] = useState(existingFacility?.name || '')
  const [errors, setErrors] = useState([])

  async function handleSubmit(event) {
    event.preventDefault()
    setErrors([])

    const body = { facility: { name } }

    try {
      const data = isEditing
        ? await patch(`/api/v1/facilities/${id}`, body)
        : await post('/api/v1/facilities', body)

      addToast(
        isEditing
          ? `Facility ${data.facility.name} updated successfully.`
          : `Facility ${data.facility.name} created successfully.`,
        'success',
      )
      navigate('/facilities')
    } catch (err) {
      setErrors(err instanceof ApiError ? err.errors || [err.message] : ['Something went wrong'])
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEditing ? 'Edit' : 'Add'} Facility</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
        {errors.length > 0 && (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {errors.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Save
        </button>
      </form>
    </div>
  )
}

export default FacilityForm
