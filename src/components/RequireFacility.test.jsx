import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router'
import RequireFacility from './RequireFacility'
import { useAuth } from '../context/useAuth.js'

// Mocks the whole module -- RequireFacility only ever calls useAuth(), so
// each test controls exactly what it returns instead of needing a real
// AuthProvider (and the GET /api/v1/me call that would trigger).
vi.mock('../context/useAuth.js')

// Renders whatever RequireFacility redirected to, so the test can inspect
// the actual URL (path + query string) it landed on.
function LocationEcho() {
  const location = useLocation()
  return <p>{location.pathname + location.search}</p>
}

function renderWithFacility(currentFacility) {
  vi.mocked(useAuth).mockReturnValue({ currentFacility })

  return render(
    <MemoryRouter initialEntries={['/appointments']}>
      <Routes>
        <Route element={<RequireFacility />}>
          <Route path="/appointments" element={<p>Appointments page</p>} />
        </Route>
        <Route path="/choose-facility" element={<LocationEcho />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('RequireFacility', () => {
  it('redirects to /choose-facility when there is no current facility', () => {
    renderWithFacility(null)

    expect(screen.queryByText('Appointments page')).not.toBeInTheDocument()
    expect(screen.getByText('/choose-facility?next=%2Fappointments')).toBeInTheDocument()
  })

  it('renders the protected route when a current facility is set', () => {
    renderWithFacility({ id: '1', name: 'Main Branch' })

    expect(screen.getByText('Appointments page')).toBeInTheDocument()
  })
})
