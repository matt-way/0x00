/** @jsxImportSource theme-ui */
import Toast from './toast'
import { useToasts } from 'state/toasts/hooks'

const Toasts = props => {
  const [toasts, toastActions] = useToasts()

  return (
    <div
      sx={{
        position: 'absolute',
        right: 0,
        bottom: '22px',
      }}>
      {toasts.map(toast => {
        const { id, type, title, message } = toast
        return (
          <Toast
            key={id}
            id={id}
            type={type}
            title={title}
            message={message}
            actions={toastActions}
          />
        )
      })}
    </div>
  )
}

export default Toasts
