import { useContext } from 'react'
import { ToastContext } from './ToastContext.jsx'

function useToast() {
  return useContext(ToastContext)
}

export { useToast }
