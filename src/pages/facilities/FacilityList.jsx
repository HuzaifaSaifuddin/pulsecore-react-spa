import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { get } from '../../api/client'
import { useAuth } from '../../context/useAuth.js'

// Any role can view (matches GET /api/v1/facilities' any-role read scope);
// Add/Edit links only show for org_admin, mirroring Django's
// {% if user.role == "org_admin" %} guard -- real enforcement is
// server-side (403), this is just not showing a link that would fail.
function FacilityList() {
  const { currentUser } = useAuth()
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFacilities() {
      try {
        const data = await get('/api/v1/facilities')
        setFacilities(data.facilities)
      } catch {
        // A 401 is already handled globally; any other failure just leaves
        // the list empty rather than crashing.
      } finally {
        setLoading(false)
      }
    }
    loadFacilities()
  }, [])

  if (loading) {
    return <p className="text-gray-500">Loading…</p>
  }

  const isOrgAdmin = currentUser?.role === 'org_admin'

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Facilities</h1>
        {isOrgAdmin && (
          <Link to="/facilities/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Add Facility
          </Link>
        )}
      </div>
      <table className="w-full bg-white rounded shadow overflow-hidden">
        <thead className="bg-gray-100 text-left text-sm text-gray-600">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {facilities.length === 0 && (
            <tr>
              <td colSpan="2" className="px-4 py-6 text-center text-gray-500">
                No facilities yet.
              </td>
            </tr>
          )}
          {facilities.map((facility) => (
            <tr key={facility.id} className="border-t border-gray-200">
              <td className="px-4 py-2">{facility.name}</td>
              <td className="px-4 py-2 text-right">
                {isOrgAdmin && (
                  <Link
                    to={`/facilities/${facility.id}/edit`}
                    state={{ facility }}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default FacilityList
