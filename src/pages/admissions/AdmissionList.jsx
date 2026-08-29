import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { get } from '../../api/client'
import DateNavigator from '../../components/DateNavigator'
import StatusTabs from '../../components/StatusTabs'
import { useAuth } from '../../context/useAuth.js'
import { toLocalDateString } from '../../utils/date'
import { formatStatus } from '../../utils/status'
import AdmissionDetailPanel from './AdmissionDetailPanel'

// Identical shape to AppointmentList -- see that file's comments -- with
// the ?appointment= param and admission/scheduled_start field names
// swapped for admission/admission_start.
const STATUS_TABS = [
  ['all', 'All'],
  ['scheduled', 'Scheduled'],
  ['arrived', 'Arrived'],
  ['admitted', 'Admitted'],
  ['discharged', 'Discharged'],
  ['cancelled', 'Cancelled'],
]

function AdmissionList() {
  const { currentFacility } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const statusFilter = searchParams.get('status') || 'scheduled'
  const selectedDateString = searchParams.get('date') || toLocalDateString(new Date())
  const selectedDate = new Date(`${selectedDateString}T00:00:00`)
  const selectedAdmissionId = searchParams.get('admission')

  const [admissions, setAdmissions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAdmissions() {
      setLoading(true)
      const data = await get(`/api/v1/admissions?date=${selectedDateString}`)
      setAdmissions(data.admissions)
      setLoading(false)
    }
    loadAdmissions()
  }, [selectedDateString])

  function handleDateChange(newDate) {
    setSearchParams({ status: statusFilter, date: toLocalDateString(newDate) })
  }

  function handleStatusChange(newStatus) {
    setSearchParams({ status: newStatus, date: selectedDateString })
  }

  function handleRowClick(admissionId) {
    setSearchParams(
      { status: statusFilter, date: selectedDateString, admission: admissionId },
      { replace: true },
    )
  }

  function handleAdmissionUpdate(updatedAdmission) {
    setAdmissions((previous) =>
      previous.map((admission) => (admission.id === updatedAdmission.id ? updatedAdmission : admission)),
    )
  }

  const visibleAdmissions =
    statusFilter === 'all' ? admissions : admissions.filter((a) => a.status === statusFilter)
  const selectedAdmission = admissions.find((a) => a.id === selectedAdmissionId)

  if (loading) {
    return <p className="text-gray-500">Loading…</p>
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-16">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admissions</h1>
            <p className="text-sm text-gray-500">{currentFacility?.name}</p>
          </div>
          <DateNavigator selectedDate={selectedDate} onChange={handleDateChange} />
        </div>
        <Link to="/admissions/search" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Book Admission
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
              {visibleAdmissions.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                    No admissions in this view.
                  </td>
                </tr>
              )}
              {visibleAdmissions.map((admission) => (
                <tr
                  key={admission.id}
                  onClick={() => handleRowClick(admission.id)}
                  className={`border-t border-gray-200 cursor-pointer hover:bg-gray-50 ${
                    selectedAdmissionId === admission.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="px-4 py-2">
                    {admission.patient.first_name} {admission.patient.last_name}
                  </td>
                  <td className="px-4 py-2">
                    {admission.doctor ? `${admission.doctor.first_name} ${admission.doctor.last_name}` : '—'}
                  </td>
                  <td className="px-4 py-2">{new Date(admission.admission_start).toLocaleString()}</td>
                  <td className="px-4 py-2">{formatStatus(admission.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="w-1/2">
          <div className="bg-white rounded shadow p-6 min-h-[16rem]">
            {selectedAdmission ? (
              <AdmissionDetailPanel
                admission={selectedAdmission}
                statusFilter={statusFilter}
                selectedDate={selectedDate}
                onUpdate={handleAdmissionUpdate}
              />
            ) : (
              <p className="text-gray-500 text-center py-12">Select an admission to view details.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdmissionList
