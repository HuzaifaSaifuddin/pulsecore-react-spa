import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router'
import RequireOrgAdmin from '../../src/components/RequireOrgAdmin'
import { useAuth } from '../../src/context/useAuth.js'

vi.mock('../../src/context/useAuth.js')

function renderWithUser(currentUser) {
  vi.mocked(useAuth).mockReturnValue({ currentUser })

  return render(
    <MemoryRouter initialEntries={['/facilities/new']}>
      <Routes>
        <Route element={<RequireOrgAdmin />}>
          <Route path="/facilities/new" element={<p>Add facility page</p>} />
        </Route>
        <Route path="/" element={<p>Home page</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('RequireOrgAdmin', () => {
  it('redirects a non-admin role to home', () => {
    renderWithUser({ role: 'receptionist' })

    expect(screen.queryByText('Add facility page')).not.toBeInTheDocument()
    expect(screen.getByText('Home page')).toBeInTheDocument()
  })

  it('redirects when there is no logged-in user at all', () => {
    renderWithUser(null)

    expect(screen.getByText('Home page')).toBeInTheDocument()
  })

  it('renders the protected route for an org_admin', () => {
    renderWithUser({ role: 'org_admin' })

    expect(screen.getByText('Add facility page')).toBeInTheDocument()
  })
})
