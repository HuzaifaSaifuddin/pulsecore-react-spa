import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StatusTabs from './StatusTabs'

const TABS = [
  ['all', 'All'],
  ['scheduled', 'Scheduled'],
  ['cancelled', 'Cancelled'],
]

describe('StatusTabs', () => {
  it('renders every tab label', () => {
    render(<StatusTabs tabs={TABS} activeStatus="scheduled" onChange={() => {}} />)

    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Scheduled')).toBeInTheDocument()
    expect(screen.getByText('Cancelled')).toBeInTheDocument()
  })

  it('styles the active tab differently from inactive ones', () => {
    render(<StatusTabs tabs={TABS} activeStatus="scheduled" onChange={() => {}} />)

    expect(screen.getByText('Scheduled')).toHaveClass('bg-white')
    expect(screen.getByText('All')).not.toHaveClass('bg-white')
  })

  it("calls onChange with the clicked tab's value", async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    render(<StatusTabs tabs={TABS} activeStatus="scheduled" onChange={handleChange} />)

    await user.click(screen.getByText('Cancelled'))

    expect(handleChange).toHaveBeenCalledWith('cancelled')
  })
})
