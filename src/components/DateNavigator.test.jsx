import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DateNavigator from './DateNavigator'

describe('DateNavigator', () => {
  it('shows the selected date, formatted', () => {
    render(<DateNavigator selectedDate={new Date('2026-03-15T00:00:00')} onChange={() => {}} />)

    expect(screen.getByText('15 Mar 2026')).toBeInTheDocument()
  })

  it('calls onChange with the previous day when the back arrow is clicked', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    render(<DateNavigator selectedDate={new Date('2026-03-15T00:00:00')} onChange={handleChange} />)

    await user.click(screen.getByLabelText('Previous day'))

    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange.mock.calls[0][0].getDate()).toBe(14)
  })

  it('calls onChange with the next day when the forward arrow is clicked', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    render(<DateNavigator selectedDate={new Date('2026-03-15T00:00:00')} onChange={handleChange} />)

    await user.click(screen.getByLabelText('Next day'))

    expect(handleChange.mock.calls[0][0].getDate()).toBe(16)
  })

  it('calls onChange with today when "Today" is clicked', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    render(<DateNavigator selectedDate={new Date('2020-01-01T00:00:00')} onChange={handleChange} />)

    await user.click(screen.getByText('Today'))

    const today = new Date()
    expect(handleChange.mock.calls[0][0].toDateString()).toBe(today.toDateString())
  })

  it('highlights "Today" only when the selected date actually is today', () => {
    render(<DateNavigator selectedDate={new Date()} onChange={() => {}} />)
    expect(screen.getByText('Today')).toHaveClass('text-blue-600')
  })

  it('does not highlight "Today" for a different date', () => {
    render(<DateNavigator selectedDate={new Date('2020-01-01T00:00:00')} onChange={() => {}} />)
    expect(screen.getByText('Today')).not.toHaveClass('text-blue-600')
  })
})
