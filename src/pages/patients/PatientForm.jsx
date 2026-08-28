import { useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router'
import { ApiError, patch, post } from '../../api/client'

// Shared by both the "register a new patient" and "edit an existing patient"
// routes. Editing carries the patient record in via router state (set by
// PatientList's <Link state={{ patient }}>) rather than a fresh fetch --
// the API has no GET /api/v1/patients/:id, only the org-wide index, so the
// list screen's own data is the only source for a single patient's fields.
function PatientForm() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next')

  const isEditing = Boolean(id)
  const existingPatient = location.state?.patient

  // One object instead of a useState per field -- keys match the API's
  // `patient` body exactly, so handleSubmit below can send formData
  // straight through with no per-field reassembly.
  const [formData, setFormData] = useState({
    first_name: existingPatient?.first_name || '',
    last_name: existingPatient?.last_name || '',
    date_of_birth: existingPatient?.date_of_birth || '',
    gender: existingPatient?.gender || 'male',
    phone_number: existingPatient?.phone_number || '',
    email: existingPatient?.email || '',
  })
  const [errors, setErrors] = useState([])

  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrors([])

    const body = { patient: formData }

    try {
      const data = isEditing
        ? await patch(`/api/v1/patients/${id}`, body)
        : await post('/api/v1/patients', body)

      if (next) {
        // Create supports "register inline, then continue" (e.g. from
        // booking's patient search) by handing the new patient's id back to
        // whatever sent us here. Edit has no such caller yet, so it just
        // returns to `next` as-is.
        navigate(isEditing ? next : `${next}?patient=${data.patient.id}`)
      } else {
        navigate('/patients')
      }
    } catch (err) {
      setErrors(err instanceof ApiError ? err.errors || [err.message] : ['Something went wrong'])
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditing ? 'Edit' : 'Register'} Patient
      </h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
        {errors.length > 0 && (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {errors.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </div>
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
          <label className="block text-sm font-medium text-gray-700">Date of birth</label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone number</label>
          <input
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {isEditing ? 'Save Changes' : 'Save'}
        </button>
      </form>
    </div>
  )
}

export default PatientForm
