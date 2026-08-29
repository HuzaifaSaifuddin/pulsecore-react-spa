import { useState } from 'react'
import { Link } from 'react-router'
import { ApiError, patch, post } from '../../api/client'
import { useAuth } from '../../context/useAuth.js'
import { useToast } from '../../context/useToast.js'
import { toLocalDateString } from '../../utils/date'
import { formatStatus } from '../../utils/status'

// Status-dependent label for the one "move forward" button -- mirrors
// Django's chained if/elif on appointment.status in _detail_panel.html.
const ADVANCE_LABELS = {
  scheduled: 'Mark Arrived',
  arrived: 'Start',
  in_progress: 'Complete',
}

// Success-toast copy matching the Django reference's messages.success()
// text exactly (views.py) for advance/revert/cancel/uncancel/notes. Errors
// use the API's own error message instead of Django's static text -- the
// Rails response is the more accurate, specific source (see CLAUDE.md's
// established "never hand-roll what the API already says" convention).
const SUCCESS_MESSAGES = {
  cancel: () => 'Appointment cancelled.',
  uncancel: () => 'Appointment restored to Scheduled.',
  advance_status: (a) => `Appointment marked as ${formatStatus(a.status)}.`,
  revert_status: (a) => `Appointment reverted to ${formatStatus(a.status)}.`,
}

// Read-only info + the four status actions (advance/revert/cancel/uncancel)
// + inline notes editing. No delete action -- the API has none for
// appointments (see CLAUDE.md). `onUpdate` hands the freshly-returned
// appointment back up to AppointmentList so both the selected panel and
// the row in the table stay in sync without a full list refetch.
function AppointmentDetailPanel({ appointment, statusFilter, selectedDate, onUpdate }) {
  const { currentFacility } = useAuth()
  const { addToast } = useToast()
  const [notes, setNotes] = useState(appointment.notes || '')

  const nextUrl = `/appointments?status=${statusFilter}&date=${toLocalDateString(selectedDate)}&appointment=${appointment.id}`

  async function runAction(action) {
    try {
      const data = await post(`/api/v1/appointments/${appointment.id}/${action}`)
      onUpdate(data.appointment)
      addToast(SUCCESS_MESSAGES[action](data.appointment), 'success')
    } catch (err) {
      addToast(err instanceof ApiError ? err.errors?.[0] || err.message : 'Something went wrong', 'error')
    }
  }

  async function handleSaveNotes(event) {
    event.preventDefault()
    try {
      const data = await patch(`/api/v1/appointments/${appointment.id}`, {
        appointment: { notes },
      })
      onUpdate(data.appointment)
      addToast('Notes updated.', 'success')
    } catch (err) {
      addToast(err instanceof ApiError ? err.errors?.[0] || err.message : 'Something went wrong', 'error')
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-gray-900">
          {appointment.patient.first_name} {appointment.patient.last_name}
        </h2>
        <Link
          to={`/patients/${appointment.patient.id}/edit?next=${encodeURIComponent(nextUrl)}`}
          state={{ patient: appointment.patient }}
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
        MRN {appointment.patient.mrn} &middot; {appointment.patient.gender} &middot; DOB{' '}
        {appointment.patient.date_of_birth}
      </p>

      <dl className="grid grid-cols-2 gap-3 text-sm mb-6">
        <div>
          <dt className="text-gray-500">Facility</dt>
          <dd className="text-gray-900">{currentFacility?.name}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Doctor</dt>
          <dd className="text-gray-900">
            {appointment.doctor ? `${appointment.doctor.first_name} ${appointment.doctor.last_name}` : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500">Scheduled</dt>
          <dd className="text-gray-900">{new Date(appointment.scheduled_start).toLocaleString()}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Status</dt>
          <dd className="text-gray-900">{formatStatus(appointment.status)}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Phone</dt>
          <dd className="text-gray-900">{appointment.patient.phone_number}</dd>
        </div>
      </dl>

      <div className="flex gap-3 mb-6 flex-wrap">
        <Link
          to={`/appointments/${appointment.id}/edit`}
          state={{ appointment }}
          className="text-sm text-gray-600 border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50"
        >
          Edit
        </Link>

        {appointment.status === 'scheduled' && (
          <button
            onClick={() => runAction('cancel')}
            className="text-sm text-gray-600 border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}

        {appointment.status === 'cancelled' && (
          <button
            onClick={() => runAction('uncancel')}
            className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
          >
            Restore
          </button>
        )}

        {appointment.status !== 'scheduled' && appointment.status !== 'cancelled' && (
          <button onClick={() => runAction('revert_status')} className="text-sm text-gray-500 hover:underline">
            &larr; Go back
          </button>
        )}

        {ADVANCE_LABELS[appointment.status] && (
          <button
            onClick={() => runAction('advance_status')}
            className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
          >
            {ADVANCE_LABELS[appointment.status]}
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

export default AppointmentDetailPanel
