import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { get } from '../../api/client'
import { useAuth } from '../../context/useAuth.js'

// Any role can view (matches GET /api/v1/users' any-role read scope); Add
// link only for org_admin. No Edit link anywhere -- no PATCH
// /api/v1/users/:id exists at all, unlike every other list in this app
// (see CLAUDE.md).
function AccountList() {
  const { currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await get('/api/v1/users')
        setUsers(data.users)
      } catch {
        // A 401 is already handled globally; any other failure just leaves
        // the list empty rather than crashing.
      } finally {
        setLoading(false)
      }
    }
    loadUsers()
  }, [])

  if (loading) {
    return <p className="text-gray-500">Loading…</p>
  }

  const isOrgAdmin = currentUser?.role === 'org_admin'

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
        {isOrgAdmin && (
          <Link to="/accounts/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Add User
          </Link>
        )}
      </div>
      <table className="w-full bg-white rounded shadow overflow-hidden">
        <thead className="bg-gray-100 text-left text-sm text-gray-600">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan="2" className="px-4 py-6 text-center text-gray-500">
                No accounts yet.
              </td>
            </tr>
          )}
          {users.map((account) => (
            <tr key={account.id} className="border-t border-gray-200">
              <td className="px-4 py-2">{account.email}</td>
              <td className="px-4 py-2">{account.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AccountList
