// Prop-driven, no state of its own -- `tabs` is [[value, label], ...],
// filtering itself is just a plain .filter() done by whoever renders this
// (no `?status=` API param exists or is needed for appointments/admissions).
function StatusTabs({ tabs, activeStatus, onChange }) {
  return (
    <div className="flex gap-1 bg-gray-100 rounded p-1 mb-4 w-fit">
      {tabs.map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={`px-3 py-1.5 text-sm rounded ${
            activeStatus === value
              ? 'bg-white shadow text-gray-900 font-medium'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default StatusTabs
