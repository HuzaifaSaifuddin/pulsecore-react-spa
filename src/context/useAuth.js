import { useContext } from 'react'
import { AuthContext } from './AuthContext.jsx'

function useAuth() {
  return useContext(AuthContext)
}

export { useAuth }
