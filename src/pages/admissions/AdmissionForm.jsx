import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router'
import { ApiError, get, patch, post } from '../../api/client'
import { useAuth } from '../../context/useAuth.js'
import { toDatetimeLocalString, toLocalDateString } from '../../utils/date'

// Identical shape to AppointmentForm -- see that file's comments -- with
// scheduled_start/scheduled_end swapped for admission_start/admission_end.
function AdmissionForm() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { currentFacility } = useAuth()

  const isEditing = Boolean(id)
  const existingAdmission = location.state?.admission
  const patientId = searchParams.get('patient')

  const [patient, setPatient] = useState(location.state?.patient || null)
  const [patientResolved, setPatientResolved] = useState(Boolean(patient) || isEditing)
  const [doctors, setDoctors] = useState([])
  const [errors, setErrors] = useState([])

  const [formData, setFormData] = useState({
    doctor_id: existingAdmission?.doctor?.id || '',
    admission_start: existingAdmission
      ? toDatetimeLocalString(new Date(existingAdmission.admission_start))
      : toDatetimeLocalString(new Date()),
    admission_end: existingAdmission?.admission_end
      ? toDatetimeLocalString(new Date(existingAdmission.admission_end))
      : '',
    notes: '',
  })

  useEffect(() => {
    if (patient || isEditing) return
    async function resolvePatient() {
      const data = await get('/api/v1/patients')
      setPatient(data.patients.find((p) => p.id === patientId) || null)
      setPatientResolved(true)
    }
    resolvePatient()
  }, [patient, isEditing, patientId])

  useEffect(() => {
    async function loadDoctors() {
      const data = await get('/api/v1/users')
      setDoctors(data.users.filter((user) => user.role === 'doctor'))
    }
    loadDoctors()
  }, [])

  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrors([])

    const body = isEditing
      ? {
          admission: {
            doctor_id: formData.doctor_id || null,
            admission_start: formData.admission_start,
            admission_end: formData.admission_end || null,
          },
        }
      : {
          admission: {
            patient_id: patient.id,
            doctor_id: formData.doctor_id || null,
            admission_start: formData.admission_start,
            admission_end: formData.admission_end || null,
            notes: formData.notes,
          },
        }

    try {
      const data = isEditing
        ? await patch(`/api/v1/admissions/${id}`, body)
        : await post('/api/v1/admissions', body)

      const admission = data.admission
      const admissionDate = toLocalDateString(new Date(admission.admission_start))
      navigate(`/admissions?status=${admission.status}&date=${admissionDate}&admission=${admission.id}`)
    } catch (err) {
      setErrors(err instanceof ApiError ? err.errors || [err.message] : ['Something went wrong'])
    }
  }

  if (!isEditing && patientResolved && !patient) {
    return <Navigate to="/admissions/search" replace />
  }
  if (!isEditing && !patientResolved) {
    return <p className="text-gray-500">Loading…</p>
  }

  const displayPatient = isEditing ? existingAdmission?.patient : patient

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{isEditing ? 'Edit' : 'Book'} Admission</h1>
      <p className="text-gray-600 mb-6">
        for {displayPatient ? `${displayPatient.first_name} ${displayPatient.last_name}` : '—'}
      </p>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
        {errors.length > 0 && (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {errors.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </div>
        )}
        <div>
          <span className="block text-sm font-medium text-gray-700">Facility</span>
          <p className="mt-1 text-gray-900">{currentFacility?.name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Doctor</label>
          <select
            name="doctor_id"
            value={formData.doctor_id}
            onChange={handleChange}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">— None —</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.first_name} {doctor.last_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Admission start</label>
          <input
            type="datetime-local"
            name="admission_start"
            value={formData.admission_start}
            onChange={handleChange}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Admission end</label>
          <input
            type="datetime-local"
            name="admission_end"
            value={formData.admission_end}
            onChange={handleChange}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        {!isEditing && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        )}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          {isEditing ? 'Save Changes' : 'Book Admission'}
        </button>
      </form>
    </div>
  )
}

export default AdmissionForm
