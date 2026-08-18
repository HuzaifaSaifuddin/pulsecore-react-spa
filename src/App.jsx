import { useState, useEffect } from 'react'
import {
  Routes,
  Route,
  Link,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router'

function Login() {
  return (
    <>
      <h1>Login page</h1>
      <Link to="/">Go home</Link>
    </>
  )
}

function Home() {
  return <h1>Home page</h1>
}

function About() {
  return <h1>About page</h1>
}

function Career() {
  return <h1>Career page</h1>
}

function FetchFacilities() {
  useEffect(() => {
    async function loadFacilities() {
      const response = await fetch('http://localhost:3000/api/v1/facilities.json', {
        credentials: 'include',
      })
      const data = await response.json()
      console.log(data)
    }
    loadFacilities()
  }, [])

  return (
    <>
      <h1>Facilities</h1>
    </>
  )
}

function AuthenticatedLayout({ isLoggedIn }) {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return (
    <>
      <nav>
        <Link to="/">Home</Link>
        {' | '}
        <Link to="/about">About</Link>
        {' | '}
        <Link to="/career">Career</Link>
      </nav>
      <Outlet />
    </>
  )
}

function RequireFacility({ currentFacility }) {
  const location = useLocation()

  if (!currentFacility) {
    return (
      <Navigate
        to={`/choose-facility?next=${encodeURIComponent(location.pathname)}`}
        replace
      />
    )
  }

  return <Outlet />
}

function ChooseFacility({ setCurrentFacility }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next') || '/'

  function pick(facility) {
    setCurrentFacility(facility)
    navigate(next, { replace: true })
  }

  return (
    <>
      <h1>Choose a facility</h1>
      <button onClick={() => pick('Main Hospital')}>Main Hospital</button>
      <button onClick={() => pick('North Clinic')}>North Clinic</button>
    </>
  )
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentFacility, setCurrentFacility] = useState(null)

  return (
    <>
      <button onClick={() => setIsLoggedIn(!isLoggedIn)}>
        {isLoggedIn ? 'Log out' : 'Log in'}
      </button>

      <FetchFacilities />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<AuthenticatedLayout isLoggedIn={isLoggedIn} />}>
          <Route
            path="/choose-facility"
            element={<ChooseFacility setCurrentFacility={setCurrentFacility} />}
          />
          <Route element={<RequireFacility currentFacility={currentFacility} />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/career" element={<Career />} />
          </Route>
        </Route>
      </Routes>
    </>
  )
}

export default App
