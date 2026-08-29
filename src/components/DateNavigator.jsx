import { useRef } from 'react'
import { toLocalDateString } from '../utils/date'

// Prop-driven, no state of its own -- selectedDate/onChange are owned by
// whoever renders this (AppointmentList/AdmissionList), same shape as
// StatusTabs. Reusable across both list screens.
function DateNavigator({ selectedDate, onChange }) {
  const dateInputRef = useRef(null)
  const today = new Date()

  function shiftBy(days) {
    const next = new Date(selectedDate)
    next.setDate(next.getDate() + days)
    onChange(next)
  }

  function openPicker() {
    if (dateInputRef.current?.showPicker) {
      dateInputRef.current.showPicker()
    } else {
      dateInputRef.current?.focus()
    }
  }

  const isToday = toLocalDateString(selectedDate) === toLocalDateString(today)

  return (
    <div className="flex items-center gap-6">
      <button
        type="button"
        onClick={() => shiftBy(-1)}
        className="p-1.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
        aria-label="Previous day"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.04-.02z"
          />
        </svg>
      </button>

      <span className="text-sm text-gray-600 w-36 text-center">
        {selectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
      </span>

      <button
        type="button"
        onClick={() => shiftBy(1)}
        className="p-1.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
        aria-label="Next day"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.04-.02z"
          />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => onChange(today)}
        className={`px-3 py-1 text-sm rounded border ${
          isToday
            ? 'border-blue-600 text-blue-600 bg-blue-50'
            : 'border-gray-300 text-gray-600 hover:bg-gray-50'
        }`}
      >
        Today
      </button>

      <span className="relative inline-block">
        <button
          type="button"
          onClick={openPicker}
          className="p-1.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer"
          title="Jump to date"
          aria-label="Jump to date"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-4 w-4"
          >
            <rect x="3" y="4" width="14" height="13" rx="2" />
            <line x1="3" y1="8" x2="17" y2="8" />
            <line x1="7" y1="2" x2="7" y2="5" />
            <line x1="13" y1="2" x2="13" y2="5" />
          </svg>
        </button>
        <input
          ref={dateInputRef}
          type="date"
          value={toLocalDateString(selectedDate)}
          onChange={(event) => onChange(new Date(`${event.target.value}T00:00:00`))}
          className="sr-only"
        />
      </span>
    </div>
  )
}

export default DateNavigator
