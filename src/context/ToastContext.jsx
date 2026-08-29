import { createContext, useState } from 'react'

const ToastContext = createContext(null)

// Same Provider/useContext shape as AuthContext -- a second, independent
// Context, mounted once at the root (main.jsx) alongside AuthProvider.
// Neither Provider knows about the other; any component that wants toasts
// just calls useToast(), same as any component wanting auth state calls
// useAuth() -- both available from the same tree position, consumed
// independently.
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  function removeToast(id) {
    setToasts((previous) => previous.filter((toast) => toast.id !== id))
  }

  // addToast is called imperatively from event handlers (a form's submit
  // succeeding, a status action's response coming back) -- never during
  // render -- so the auto-dismiss setTimeout doesn't need a useEffect
  // cleanup here. ToastProvider itself never unmounts (it wraps the whole
  // app for its entire lifetime), so there's no "setState after unmount"
  // risk the way there would be if an individual toast component owned its
  // own timer.
  function addToast(message, type = 'info') {
    const id = crypto.randomUUID()
    setToasts((previous) => [...previous, { id, message, type }])
    setTimeout(() => removeToast(id), 4000)
  }

  const value = { toasts, addToast, removeToast }

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export { ToastContext, ToastProvider }
