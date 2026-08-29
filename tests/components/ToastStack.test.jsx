import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider } from '../../src/context/ToastContext.jsx'
import { useToast } from '../../src/context/useToast.js'
import ToastStack from '../../src/components/ToastStack'

// A tiny consumer so tests can trigger addToast() the same way a real
// screen would (via useToast()), rather than reaching into ToastProvider's
// internals.
function TestHarness() {
  const { addToast } = useToast()
  return (
    <>
      <button onClick={() => addToast('Saved successfully.', 'success')}>Trigger success</button>
      <button onClick={() => addToast('Something broke.', 'error')}>Trigger error</button>
      <ToastStack />
    </>
  )
}

afterEach(() => {
  vi.useRealTimers()
})

describe('ToastStack', () => {
  it('renders nothing when there are no toasts', () => {
    const { container } = render(
      <ToastProvider>
        <ToastStack />
      </ToastProvider>,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('shows a toast after addToast is called, styled by type', async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <TestHarness />
      </ToastProvider>,
    )

    await user.click(screen.getByText('Trigger success'))

    const toast = screen.getByText('Saved successfully.')
    expect(toast).toBeInTheDocument()
    expect(toast.closest('div')).toHaveClass('bg-green-50')
  })

  it('lets the user dismiss a toast manually', async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <TestHarness />
      </ToastProvider>,
    )

    await user.click(screen.getByText('Trigger error'))
    expect(screen.getByText('Something broke.')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Dismiss'))
    expect(screen.queryByText('Something broke.')).not.toBeInTheDocument()
  })

  it('auto-dismisses a toast after 4 seconds', () => {
    vi.useFakeTimers()
    render(
      <ToastProvider>
        <TestHarness />
      </ToastProvider>,
    )

    // fireEvent (not userEvent) here -- userEvent's own internal timers
    // would otherwise collide with the fake ones this test needs to
    // advance manually.
    fireEvent.click(screen.getByText('Trigger success'))
    expect(screen.getByText('Saved successfully.')).toBeInTheDocument()

    // act() wraps this because advancing a fake timer fires the setTimeout
    // callback (which calls setState) outside of any React-managed event --
    // without it, the resulting DOM update isn't guaranteed to have flushed
    // yet by the time the assertion below runs.
    act(() => {
      vi.advanceTimersByTime(4000)
    })

    expect(screen.queryByText('Saved successfully.')).not.toBeInTheDocument()
  })
})
