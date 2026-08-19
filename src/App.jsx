import { Routes, Route } from 'react-router'
import { useAuth } from './context/useAuth.js'
import AuthenticatedLayout from './components/AuthenticatedLayout'
import RequireFacility from './components/RequireFacility'
import Login from './pages/Login'
import Home from './pages/Home'
import About from './pages/About'
import Career from './pages/Career'
import ChooseFacility from './pages/ChooseFacility'

function App() {
  const { checkingSession } = useAuth()

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading…
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AuthenticatedLayout />}>
        <Route path="/choose-facility" element={<ChooseFacility />} />
        <Route element={<RequireFacility />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/career" element={<Career />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
