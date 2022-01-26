import { buildModel } from 'state-management/builder'

export const TOAST_TYPES = {
  info: 'info',
  success: 'success',
  error: 'error',
  warning: 'warning',
}

const initialState = () => []

export const { actions, reducer, constants } = buildModel(
  'toasts',
  initialState(),
  {
    addToast: (toasts, id, title, message, type) => {
      if (toasts.find(toast => toast.id === id)) {
        return toasts
      }

      return [
        {
          id,
          title,
          message,
          type,
        },
        ...toasts,
      ]
    },
    removeToast: (toasts, id) => {
      return toasts.filter(toast => toast.id !== id)
    },
  }
)
