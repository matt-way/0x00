/** @jsxImportSource theme-ui */
import { TOAST_TYPES } from 'state/toasts/model'
import { Icon } from 'components/system'

const colors = {
  [TOAST_TYPES.info]: 'blue',
  [TOAST_TYPES.success]: 'green',
  [TOAST_TYPES.warning]: 'yellow',
  [TOAST_TYPES.error]: 'red',
}

const Toast = props => {
  const { id, title, message, type, actions } = props

  return (
    <div
      sx={{
        backgroundColor: 'surface',
        margin: [6],
        padding: [6],
        borderLeft: `4px solid ${colors[type]}`,
        borderRadius: '3px 0 0 3px',
        paddingRight: '30px',
        position: 'relative',
      }}
      onClick={() => actions.remove(id)}>
      <div>{title}</div>
      <div
        sx={{
          marginTop: [6],
          color: 'textSecondary',
        }}>
        {message}
      </div>
      <Icon
        sx={{
          width: 18,
          height: 18,
          position: 'absolute',
          right: '4px',
          top: '4px',
          cursor: 'pointer',
        }}
        type="close"
        onClick={() => actions.remove(id)}
      />
    </div>
  )
}

export default Toast
