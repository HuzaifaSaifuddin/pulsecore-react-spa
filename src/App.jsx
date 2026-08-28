import { Routes, Route } from 'react-router'
import { useAuth } from './context/useAuth.js'
import AuthenticatedLayout from './components/AuthenticatedLayout'
import RequireFacility from './components/RequireFacility'
import Login from './pages/Login'
import Home from './pages/Home'
import ChooseFacility from './pages/ChooseFacility'
import PatientList from './pages/patients/PatientList'
import PatientForm from './pages/patients/PatientForm'

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
        {/* Patients is org-scoped, not facility-scoped (brief §4/§5) -- no
            current-facility requirement, so these sit outside RequireFacility. */}
        <Route path="/patients" element={<PatientList />} />
        <Route path="/patients/new" element={<PatientForm />} />
        <Route path="/patients/:id/edit" element={<PatientForm />} />
        <Route element={<RequireFacility />}>
          <Route path="/" element={<Home />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
