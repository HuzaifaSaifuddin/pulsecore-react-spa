import { Routes, Route } from 'react-router'
import { useAuth } from './context/useAuth.js'
import AuthenticatedLayout from './components/AuthenticatedLayout'
import RequireFacility from './components/RequireFacility'
import Login from './pages/Login'
import Home from './pages/Home'
import ChooseFacility from './pages/ChooseFacility'
import PatientList from './pages/patients/PatientList'
import PatientForm from './pages/patients/PatientForm'
import AppointmentList from './pages/appointments/AppointmentList'
import AppointmentPatientSearch from './pages/appointments/AppointmentPatientSearch'
import AppointmentForm from './pages/appointments/AppointmentForm'
import AdmissionList from './pages/admissions/AdmissionList'
import AdmissionPatientSearch from './pages/admissions/AdmissionPatientSearch'
import AdmissionForm from './pages/admissions/AdmissionForm'
import FacilityList from './pages/facilities/FacilityList'
import FacilityForm from './pages/facilities/FacilityForm'
import AccountList from './pages/accounts/AccountList'
import AccountForm from './pages/accounts/AccountForm'
import RequireOrgAdmin from './components/RequireOrgAdmin'

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
        {/* Facilities/Accounts are also org-scoped, list readable by any
            role -- only the create/edit routes are org_admin-only. */}
        <Route path="/facilities" element={<FacilityList />} />
        <Route path="/accounts" element={<AccountList />} />
        <Route element={<RequireOrgAdmin />}>
          <Route path="/facilities/new" element={<FacilityForm />} />
          <Route path="/facilities/:id/edit" element={<FacilityForm />} />
          <Route path="/accounts/new" element={<AccountForm />} />
        </Route>
        {/* Appointments is facility-scoped (409 without a current facility),
            so these sit inside RequireFacility. */}
        <Route element={<RequireFacility />}>
          <Route path="/" element={<Home />} />
          <Route path="/appointments" element={<AppointmentList />} />
          <Route path="/appointments/search" element={<AppointmentPatientSearch />} />
          <Route path="/appointments/new" element={<AppointmentForm />} />
          <Route path="/appointments/:id/edit" element={<AppointmentForm />} />
          <Route path="/admissions" element={<AdmissionList />} />
          <Route path="/admissions/search" element={<AdmissionPatientSearch />} />
          <Route path="/admissions/new" element={<AdmissionForm />} />
          <Route path="/admissions/:id/edit" element={<AdmissionForm />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
