import { createContext, useState, useEffect } from 'react'
import { get, post, del } from '../api/client'

const AuthContext = createContext(null)

function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [currentFacility, setCurrentFacility] = useState(null)
  const [accessibleFacilities, setAccessibleFacilities] = useState([])
  const [checkingSession, setCheckingSession] = useState(true)

  async function loadSession() {
    try {
      const data = await get('/api/v1/me')
      setCurrentUser(data.user)
      setCurrentFacility(data.current_facility)
      setAccessibleFacilities(data.accessible_facilities)
    } catch {
      setCurrentUser(null)
      setCurrentFacility(null)
      setAccessibleFacilities([])
    } finally {
      setCheckingSession(false)
    }
  }

  useEffect(() => {
    // loadSession's setState calls all happen after `await get(...)` resolves - a real async
    // boundary, matching this rule's actual intent - but its static analysis can't trace that
    // through a separately-named async function call, so this is a known false positive.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSession()
  }, [])

  async function login(email, password) {
    await post('/users/sign_in', { user: { email, password } })
    await loadSession()
  }

  async function logout() {
    try {
      await del('/users/sign_out')
    } catch {
      // Already signed out server-side either way - clear local state regardless.
    }
    setCurrentUser(null)
    setCurrentFacility(null)
    setAccessibleFacilities([])
  }

  const value = {
    currentUser,
    currentFacility,
    accessibleFacilities,
    isLoggedIn: !!currentUser,
    checkingSession,
    login,
    logout,
    setCurrentFacility,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
