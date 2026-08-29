import { useState } from 'react'
import { Link } from 'react-router'
import { ApiError, patch, post } from '../../api/client'
import { useAuth } from '../../context/useAuth.js'
import { toLocalDateString } from '../../utils/date'
import { formatStatus } from '../../utils/status'

// Identical shape to AppointmentDetailPanel -- one extra rung on the
// advance ladder (arrived -> admitted -> discharged, vs. appointment's
// arrived -> in_progress -> completed) and admission_start/admission_end
// instead of scheduled_start/scheduled_end.
const ADVANCE_LABELS = {
  scheduled: 'Mark Arrived',
  arrived: 'Mark Admitted',
  admitted: 'Mark Discharged',
}

function AdmissionDetailPanel({ admission, statusFilter, selectedDate, onUpdate }) {
  const { currentFacility } = useAuth()
  const [notes, setNotes] = useState(admission.notes || '')
  const [error, setError] = useState(null)

  const nextUrl = `/admissions?status=${statusFilter}&date=${toLocalDateString(selectedDate)}&admission=${admission.id}`

  async function runAction(action) {
    setError(null)
    try {
      const data = await post(`/api/v1/admissions/${admission.id}/${action}`)
      onUpdate(data.admission)
    } catch (err) {
      setError(err instanceof ApiError ? err.errors?.[0] || err.message : 'Something went wrong')
    }
  }

  async function handleSaveNotes(event) {
    event.preventDefault()
    setError(null)
    try {
      const data = await patch(`/api/v1/admissions/${admission.id}`, { admission: { notes } })
      onUpdate(data.admission)
    } catch (err) {
      setError(err instanceof ApiError ? err.errors?.[0] || err.message : 'Something went wrong')
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-gray-900">
          {admission.patient.first_name} {admission.patient.last_name}
        </h2>
        <Link
          to={`/patients/${admission.patient.id}/edit?next=${encodeURIComponent(nextUrl)}`}
          state={{ patient: admission.patient }}
          className="text-gray-400 hover:text-gray-700"
          title="Edit patient"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
            <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10a.75.75 0 0 0 0-1.5H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
          </svg>
        </Link>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        MRN {admission.patient.mrn} &middot; {admission.patient.gender} &middot; DOB{' '}
        {admission.patient.date_of_birth}
      </p>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <dl className="grid grid-cols-2 gap-3 text-sm mb-6">
        <div>
          <dt className="text-gray-500">Facility</dt>
          <dd className="text-gray-900">{currentFacility?.name}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Doctor</dt>
          <dd className="text-gray-900">
            {admission.doctor ? `${admission.doctor.first_name} ${admission.doctor.last_name}` : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500">Scheduled</dt>
          <dd className="text-gray-900">{new Date(admission.admission_start).toLocaleString()}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Status</dt>
          <dd className="text-gray-900">{formatStatus(admission.status)}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Phone</dt>
          <dd className="text-gray-900">{admission.patient.phone_number}</dd>
        </div>
      </dl>

      <div className="flex gap-3 mb-6 flex-wrap">
        <Link
          to={`/admissions/${admission.id}/edit`}
          state={{ admission }}
          className="text-sm text-gray-600 border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50"
        >
          Edit
        </Link>

        {admission.status === 'scheduled' && (
          <button
            onClick={() => runAction('cancel')}
            className="text-sm text-gray-600 border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}

        {admission.status === 'cancelled' && (
          <button
            onClick={() => runAction('uncancel')}
            className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
          >
            Restore
          </button>
        )}

        {admission.status !== 'scheduled' && admission.status !== 'cancelled' && (
          <button onClick={() => runAction('revert_status')} className="text-sm text-gray-500 hover:underline">
            &larr; Go back
          </button>
        )}

        {ADVANCE_LABELS[admission.status] && (
          <button
            onClick={() => runAction('advance_status')}
            className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
          >
            {ADVANCE_LABELS[admission.status]}
          </button>
        )}
      </div>

      <form onSubmit={handleSaveNotes}>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows="3"
          className="w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          className="mt-2 text-sm bg-gray-600 text-white px-3 py-1.5 rounded hover:bg-gray-700"
        >
          Save Notes
        </button>
      </form>
    </div>
  )
}

export default AdmissionDetailPanel
