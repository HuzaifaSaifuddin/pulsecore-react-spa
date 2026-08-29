import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { get } from '../../api/client'

function PatientList() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPatients() {
      try {
        const data = await get('/api/v1/patients')
        setPatients(data.patients)
      } catch {
        // A 401 here means the session expired mid-use -- client.js's global
        // handler already cleared auth state and the route guard is about to
        // redirect to /login, nothing left for this effect to do. Any other
        // failure is swallowed too for now; this screen has no error-UI state
        // yet, a separate gap from the uncaught-rejection one this closes.
      } finally {
        setLoading(false)
      }
    }
    loadPatients()
  }, [])

  if (loading) {
    return <p className="text-gray-500">Loading…</p>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        <Link
          to="/patients/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Register Patient
        </Link>
      </div>
      <table className="w-full bg-white rounded shadow overflow-hidden">
        <thead className="bg-gray-100 text-left text-sm text-gray-600">
          <tr>
            <th className="px-4 py-2">MRN</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Date of Birth</th>
            <th className="px-4 py-2">Phone</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {patients.length === 0 && (
            <tr>
              <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                No patients registered yet.
              </td>
            </tr>
          )}
          {patients.map((patient) => (
            <tr key={patient.id} className="border-t border-gray-200">
              <td className="px-4 py-2">{patient.mrn}</td>
              <td className="px-4 py-2">
                {patient.first_name} {patient.last_name}
              </td>
              <td className="px-4 py-2">{patient.date_of_birth}</td>
              <td className="px-4 py-2">{patient.phone_number}</td>
              <td className="px-4 py-2 text-right">
                <Link
                  to={`/patients/${patient.id}/edit`}
                  state={{ patient }}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default PatientList
