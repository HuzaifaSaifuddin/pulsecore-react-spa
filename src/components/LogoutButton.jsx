import { useNavigate } from 'react-router'
import { useAuth } from '../context/useAuth.js'

function LogoutButton() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-blue-600">
      Log out
    </button>
  )
}

export default LogoutButton
