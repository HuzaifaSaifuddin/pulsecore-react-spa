import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router'
import { ApiError, get, patch, post } from '../../api/client'
import { useAuth } from '../../context/useAuth.js'
import { useToast } from '../../context/useToast.js'
import { toDatetimeLocalString, toLocalDateString } from '../../utils/date'

// Step two of the two-step booking flow, shared with editing an existing
// appointment. patient/facility are never form fields (brief §7) -- the
// patient was already chosen in step one, and facility is always the
// user's locked-in Current Facility.
function AppointmentForm() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { currentFacility } = useAuth()
  const { addToast } = useToast()

  const isEditing = Boolean(id)
  const existingAppointment = location.state?.appointment
  const patientId = searchParams.get('patient')

  const [patient, setPatient] = useState(location.state?.patient || null)
  const [patientResolved, setPatientResolved] = useState(Boolean(patient) || isEditing)
  const [doctors, setDoctors] = useState([])
  const [errors, setErrors] = useState([])

  const [formData, setFormData] = useState({
    doctor_id: existingAppointment?.doctor?.id || '',
    scheduled_start: existingAppointment
      ? toDatetimeLocalString(new Date(existingAppointment.scheduled_start))
      : toDatetimeLocalString(new Date()),
    scheduled_end: existingAppointment?.scheduled_end
      ? toDatetimeLocalString(new Date(existingAppointment.scheduled_end))
      : '',
    notes: '',
  })

  // No GET /api/v1/patients/:id exists, so a direct visit to this URL
  // (no router state carried over from search) falls back to the org-wide
  // patients list and finds the id there -- same "index + client derive"
  // shape as the search screen and PatientForm's edit mode.
  useEffect(() => {
    if (patient || isEditing) return
    async function resolvePatient() {
      try {
        const data = await get('/api/v1/patients')
        setPatient(data.patients.find((p) => p.id === patientId) || null)
      } catch {
        // A 401 is already handled globally (redirect in flight). Any other
        // failure just leaves `patient` unresolved, which the render below
        // already treats as "redirect back to search" -- see the Navigate
        // check further down.
      } finally {
        setPatientResolved(true)
      }
    }
    resolvePatient()
  }, [patient, isEditing, patientId])

  // Doctor dropdown scoped to role=doctor only -- GET /api/v1/users has no
  // per-user facility-membership data, so unlike Django's exact
  // "Doctor-role members of this one facility" queryset, this can only
  // narrow to role org-wide. Flagged in CLAUDE.md, not silently matched.
  useEffect(() => {
    async function loadDoctors() {
      try {
        const data = await get('/api/v1/users')
        setDoctors(data.users.filter((user) => user.role === 'doctor'))
      } catch {
        // A 401 is already handled globally; any other failure just leaves
        // the doctor dropdown empty rather than crashing the form.
      }
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
          appointment: {
            doctor_id: formData.doctor_id || null,
            scheduled_start: formData.scheduled_start,
            scheduled_end: formData.scheduled_end || null,
          },
        }
      : {
          appointment: {
            patient_id: patient.id,
            doctor_id: formData.doctor_id || null,
            scheduled_start: formData.scheduled_start,
            scheduled_end: formData.scheduled_end || null,
            notes: formData.notes,
          },
        }

    try {
      const data = isEditing
        ? await patch(`/api/v1/appointments/${id}`, body)
        : await post('/api/v1/appointments', body)

      const appointment = data.appointment
      const patientName = `${appointment.patient.first_name} ${appointment.patient.last_name}`
      addToast(
        isEditing ? `Appointment for ${patientName} updated.` : `Appointment booked for ${patientName}.`,
        'success',
      )

      const scheduledDate = toLocalDateString(new Date(appointment.scheduled_start))
      navigate(
        `/appointments?status=${appointment.status}&date=${scheduledDate}&appointment=${appointment.id}`,
      )
    } catch (err) {
      setErrors(err instanceof ApiError ? err.errors || [err.message] : ['Something went wrong'])
    }
  }

  // Mirrors AppointmentCreateView._resolve_patient: no patient to book
  // for means back to search, not a broken form.
  if (!isEditing && patientResolved && !patient) {
    return <Navigate to="/appointments/search" replace />
  }
  if (!isEditing && !patientResolved) {
    return <p className="text-gray-500">Loading…</p>
  }

  const displayPatient = isEditing ? existingAppointment?.patient : patient

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {isEditing ? 'Edit' : 'Book'} Appointment
      </h1>
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
          <label className="block text-sm font-medium text-gray-700">Scheduled start</label>
          <input
            type="datetime-local"
            name="scheduled_start"
            value={formData.scheduled_start}
            onChange={handleChange}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Scheduled end</label>
          <input
            type="datetime-local"
            name="scheduled_end"
            value={formData.scheduled_end}
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
          {isEditing ? 'Save Changes' : 'Book Appointment'}
        </button>
      </form>
    </div>
  )
}

export default AppointmentForm
