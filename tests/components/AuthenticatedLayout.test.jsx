import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router'
import AuthenticatedLayout from '../../src/components/AuthenticatedLayout'
import { useAuth } from '../../src/context/useAuth.js'
import { useToast } from '../../src/context/useToast.js'

vi.mock('../../src/context/useAuth.js')
vi.mock('../../src/context/useToast.js')

function renderLayout(isLoggedIn) {
  vi.mocked(useAuth).mockReturnValue({
    isLoggedIn,
    currentUser: isLoggedIn ? { email: 'admin@apollohospitals.com', role: 'org_admin' } : null,
    currentFacility: isLoggedIn ? { id: '1', name: 'Main Branch' } : null,
    accessibleFacilities: [],
    setCurrentFacility: vi.fn(),
  })
  // ToastStack (rendered inside AuthenticatedLayout) calls this same
  // mocked hook too -- vi.mock() replaces the module for every importer,
  // not just this test file's own -- so the mock needs ToastStack's shape
  // (toasts/removeToast) as well as addToast, or it crashes on
  // `toasts.length` same as the real hook would if given the wrong shape.
  vi.mocked(useToast).mockReturnValue({ toasts: [], addToast: vi.fn(), removeToast: vi.fn() })

  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<AuthenticatedLayout />}>
          <Route path="/" element={<p>Protected home page</p>} />
        </Route>
        <Route path="/login" element={<p>Login page</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('AuthenticatedLayout', () => {
  it('redirects to /login when there is no session', () => {
    renderLayout(false)

    expect(screen.queryByText('Protected home page')).not.toBeInTheDocument()
    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  it('renders the nav and the protected content when logged in', () => {
    renderLayout(true)

    expect(screen.getByText('Protected home page')).toBeInTheDocument()
    expect(screen.getByText('PulseCore')).toBeInTheDocument()
    expect(screen.getByText('admin@apollohospitals.com')).toBeInTheDocument()
  })

  it('shows the org_admin-only nav links only for that role', () => {
    renderLayout(true)

    expect(screen.getByText('Accounts')).toBeInTheDocument()
    expect(screen.getByText('Facilities')).toBeInTheDocument()
  })
})
