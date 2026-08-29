import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { get } from '../../api/client'

// Step one of the two-step booking flow (brief §7) -- identical shape to
// AppointmentPatientSearch, see that file's comment for why this filters
// client-side over the org-wide patients index rather than a search
// endpoint (none exists).
function AdmissionPatientSearch() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [patients, setPatients] = useState([])
  const [searched, setSearched] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const formQuery = new FormData(event.target).get('q').trim()
    setSearchParams(formQuery ? { q: formQuery } : {})

    const data = await get('/api/v1/patients')
    const lowerQuery = formQuery.toLowerCase()
    const matches = data.patients.filter((patient) => {
      const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase()
      return (
        fullName.includes(lowerQuery) ||
        patient.mrn.toLowerCase().includes(lowerQuery) ||
        patient.phone_number?.includes(formQuery)
      )
    })
    setPatients(matches)
    setSearched(true)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Find Patient</h1>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search by name, MRN, or phone"
          autoFocus
          className="flex-1 rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Search
        </button>
      </form>

      {searched && (
        <table className="w-full bg-white rounded shadow overflow-hidden mb-4">
          <thead className="bg-gray-100 text-left text-sm text-gray-600">
            <tr>
              <th className="px-4 py-2">MRN</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {patients.length === 0 && (
              <tr>
                <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                  No matching patients.
                </td>
              </tr>
            )}
            {patients.map((patient) => (
              <tr key={patient.id} className="border-t border-gray-200">
                <td className="px-4 py-2">{patient.mrn}</td>
                <td className="px-4 py-2">
                  {patient.first_name} {patient.last_name}
                </td>
                <td className="px-4 py-2">{patient.phone_number}</td>
                <td className="px-4 py-2 text-right">
                  <Link
                    to={`/admissions/new?patient=${patient.id}`}
                    state={{ patient }}
                    className="text-blue-600 hover:underline"
                  >
                    Book
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className="text-sm text-gray-500">
        Patient not found?{' '}
        <Link to="/patients/new?next=/admissions/new" className="text-blue-600 hover:underline">
          Register a new patient
        </Link>
      </p>
    </div>
  )
}

export default AdmissionPatientSearch
