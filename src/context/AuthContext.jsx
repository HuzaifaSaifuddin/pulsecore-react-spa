import { createContext, useState, useEffect } from 'react'
import { get, post, del, setUnauthorizedHandler } from '../api/client'

const AuthContext = createContext(null)

function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [currentFacility, setCurrentFacility] = useState(null)
  const [accessibleFacilities, setAccessibleFacilities] = useState([])
  const [checkingSession, setCheckingSession] = useState(true)

  function clearAuthState() {
    setCurrentUser(null)
    setCurrentFacility(null)
    setAccessibleFacilities([])
  }

  async function loadSession() {
    try {
      const data = await get('/api/v1/me')
      setCurrentUser(data.user)
      setCurrentFacility(data.current_facility)
      setAccessibleFacilities(data.accessible_facilities)
    } catch {
      clearAuthState()
    } finally {
      setCheckingSession(false)
    }
  }

  useEffect(() => {
    // client.js is a plain module -- it can't call setState itself, so it
    // holds a reference to this callback instead, registered here before
    // the first request ever fires. Any 401 from anywhere in the app (not
    // just this boot check) now reaches clearAuthState -- see client.js's
    // own comment for why that's enough on its own, no navigate() needed.
    setUnauthorizedHandler(clearAuthState)

    // loadSession's setState calls all happen after `await get(...)` resolves - a real async
    // boundary, matching this rule's actual intent - but its static analysis can't trace that
    // through a separately-named async function call, so this is a known false positive.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSession()
    // clearAuthState/loadSession are redefined every render, but both only close over
    // useState setters (React guarantees these are referentially stable) and the imported
    // get/post/del (stable module-level imports) -- so despite eslint seeing "new function
    // each render" and flagging a missing dep, their actual behavior never changes between
    // renders. Using this render's versions forever via [] is genuinely safe, not a stale-
    // closure bug -- same class of known-safe case as the disable directly above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    clearAuthState()
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
