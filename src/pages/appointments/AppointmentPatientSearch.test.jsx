import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import AppointmentPatientSearch from './AppointmentPatientSearch'
import { get } from '../../api/client'

// Mocks the API client entirely -- this is step one of the two-step
// booking flow, and the thing worth testing is the client-side filtering
// and the handoff into step two, not the real network call.
vi.mock('../../api/client')

const PATIENTS = [
  { id: 'p1', first_name: 'Naida', last_name: 'Kiehn', mrn: 'P-000005', phone_number: '9623002900' },
  { id: 'p2', first_name: 'Dalila', last_name: 'Maggio', mrn: 'P-000006', phone_number: '9203094421' },
]

beforeEach(() => {
  vi.mocked(get).mockResolvedValue({ patients: PATIENTS })
})

describe('AppointmentPatientSearch (two-step booking, step one)', () => {
  it('shows no results table until a search is actually run', () => {
    render(
      <MemoryRouter>
        <AppointmentPatientSearch />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('filters the org-wide patient list client-side by name', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <AppointmentPatientSearch />
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('Search by name, MRN, or phone'), 'Naida')
    await user.click(screen.getByRole('button', { name: 'Search' }))

    expect(await screen.findByText('Naida Kiehn')).toBeInTheDocument()
    expect(screen.queryByText('Dalila Maggio')).not.toBeInTheDocument()
  })

  it('shows "no matching patients" when nothing matches the query', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <AppointmentPatientSearch />
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('Search by name, MRN, or phone'), 'Nobody')
    await user.click(screen.getByRole('button', { name: 'Search' }))

    expect(await screen.findByText('No matching patients.')).toBeInTheDocument()
  })

  it('hands the chosen patient off to step two via ?patient= in the Book link', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <AppointmentPatientSearch />
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('Search by name, MRN, or phone'), 'Naida')
    await user.click(screen.getByRole('button', { name: 'Search' }))

    const bookLink = await screen.findByRole('link', { name: 'Book' })
    expect(bookLink).toHaveAttribute('href', '/appointments/new?patient=p1')
  })

  it('offers a "create new patient inline" round-trip back into step two', () => {
    render(
      <MemoryRouter>
        <AppointmentPatientSearch />
      </MemoryRouter>,
    )

    const registerLink = screen.getByRole('link', { name: 'Register a new patient' })
    expect(registerLink).toHaveAttribute('href', '/patients/new?next=/appointments/new')
  })
})
