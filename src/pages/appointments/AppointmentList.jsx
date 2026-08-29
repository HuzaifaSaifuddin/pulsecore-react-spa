import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { get } from '../../api/client'
import DateNavigator from '../../components/DateNavigator'
import StatusTabs from '../../components/StatusTabs'
import { useAuth } from '../../context/useAuth.js'
import { toLocalDateString } from '../../utils/date'
import { formatStatus } from '../../utils/status'
import AppointmentDetailPanel from './AppointmentDetailPanel'

const STATUS_TABS = [
  ['all', 'All'],
  ['scheduled', 'Scheduled'],
  ['arrived', 'Arrived'],
  ['in_progress', 'In Progress'],
  ['completed', 'Completed'],
  ['cancelled', 'Cancelled'],
]

// The list+detail split-pane (brief §7). Selected item, status filter, and
// date all live in the URL (?status=&date=&appointment=) so the view is
// shareable/refreshable. Changing date or status pushes a normal history
// entry and drops the current selection (a different day/tab has no
// "same" row selected, matching the Django reference's own nav links);
// clicking a row only swaps the detail pane, via `replace: true` -- the
// history.replaceState-equivalent -- so browsing between rows doesn't
// pile up back-button entries.
function AppointmentList() {
  const { currentFacility } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const statusFilter = searchParams.get('status') || 'scheduled'
  const selectedDateString = searchParams.get('date') || toLocalDateString(new Date())
  const selectedDate = new Date(`${selectedDateString}T00:00:00`)
  const selectedAppointmentId = searchParams.get('appointment')

  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  // No `?status=` param exists on this endpoint -- only `?date=` -- so
  // status-tab switching filters the already-fetched day in memory
  // instead of refetching (see the .filter() below).
  useEffect(() => {
    async function loadAppointments() {
      setLoading(true)
      const data = await get(`/api/v1/appointments?date=${selectedDateString}`)
      setAppointments(data.appointments)
      setLoading(false)
    }
    loadAppointments()
  }, [selectedDateString])

  function handleDateChange(newDate) {
    setSearchParams({ status: statusFilter, date: toLocalDateString(newDate) })
  }

  function handleStatusChange(newStatus) {
    setSearchParams({ status: newStatus, date: selectedDateString })
  }

  function handleRowClick(appointmentId) {
    setSearchParams(
      { status: statusFilter, date: selectedDateString, appointment: appointmentId },
      { replace: true },
    )
  }

  // Replaces just the one appointment a status action / notes save
  // touched -- the selected detail keeps showing it even if the new
  // status has filtered it out of the table below, same as Django's
  // deliberate choice ("if you just advanced an appointment past the tab
  // you're viewing, its detail should stay visible").
  function handleAppointmentUpdate(updatedAppointment) {
    setAppointments((previous) =>
      previous.map((appointment) =>
        appointment.id === updatedAppointment.id ? updatedAppointment : appointment,
      ),
    )
  }

  const visibleAppointments =
    statusFilter === 'all' ? appointments : appointments.filter((a) => a.status === statusFilter)
  const selectedAppointment = appointments.find((a) => a.id === selectedAppointmentId)

  if (loading) {
    return <p className="text-gray-500">Loading…</p>
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-16">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
            <p className="text-sm text-gray-500">{currentFacility?.name}</p>
          </div>
          <DateNavigator selectedDate={selectedDate} onChange={handleDateChange} />
        </div>
        <Link to="/appointments/search" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Book Appointment
        </Link>
      </div>

      <StatusTabs tabs={STATUS_TABS} activeStatus={statusFilter} onChange={handleStatusChange} />

      <div className="flex gap-6 items-start">
        <div className="w-1/2">
          <table className="w-full bg-white rounded shadow overflow-hidden">
            <thead className="bg-gray-100 text-left text-sm text-gray-600">
              <tr>
                <th className="px-4 py-2">Patient</th>
                <th className="px-4 py-2">Doctor</th>
                <th className="px-4 py-2">Scheduled</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleAppointments.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                    No appointments in this view.
                  </td>
                </tr>
              )}
              {visibleAppointments.map((appointment) => (
                <tr
                  key={appointment.id}
                  onClick={() => handleRowClick(appointment.id)}
                  className={`border-t border-gray-200 cursor-pointer hover:bg-gray-50 ${
                    selectedAppointmentId === appointment.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="px-4 py-2">
                    {appointment.patient.first_name} {appointment.patient.last_name}
                  </td>
                  <td className="px-4 py-2">
                    {appointment.doctor
                      ? `${appointment.doctor.first_name} ${appointment.doctor.last_name}`
                      : '—'}
                  </td>
                  <td className="px-4 py-2">{new Date(appointment.scheduled_start).toLocaleString()}</td>
                  <td className="px-4 py-2">{formatStatus(appointment.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="w-1/2">
          <div className="bg-white rounded shadow p-6 min-h-[16rem]">
            {selectedAppointment ? (
              <AppointmentDetailPanel
                appointment={selectedAppointment}
                statusFilter={statusFilter}
                selectedDate={selectedDate}
                onUpdate={handleAppointmentUpdate}
              />
            ) : (
              <p className="text-gray-500 text-center py-12">Select an appointment to view details.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppointmentList
