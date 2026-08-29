import { useToast } from '../context/useToast.js'

// Exact classes from brief §7 / the Django reference's messages block --
// same palette discipline, blue-600 stays the only accent color, these
// three are the only semantic colors in the app.
const TOAST_STYLES = {
  success: 'bg-green-50 text-green-800 border-green-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
}

// Rendered once, inside AuthenticatedLayout right under the nav (brief:
// "rendered as a stack under the nav") -- not at the app root, since every
// screen that can trigger a toast is already inside that layout.
function ToastStack() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto mt-4 px-4 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-2 rounded text-sm border flex justify-between items-center gap-4 ${TOAST_STYLES[toast.type]}`}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="opacity-60 hover:opacity-100"
            aria-label="Dismiss"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  )
}

export default ToastStack
