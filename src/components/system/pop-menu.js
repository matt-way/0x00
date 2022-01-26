/** @jsxImportSource theme-ui */
import { Fragment } from 'react'
import { Icon } from 'components/system'

const PopMenu = props => {
  const { children, left, top, onClose, title, className } = props
  return (
    <div
      sx={{
        position: 'absolute',
        backgroundColor: 'popMenuBackground',
        left,
        top,
        padding: '8px',
        paddingTop: '4px',
        border: '2px solid #414141',
        borderRadius: '5px',
        zIndex: 99999,
      }}
      className={className}>
      <div
        sx={{
          marginBottom: '16px',
        }}>
        {title}
      </div>
      {onClose && (
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
          onClick={onClose}
        />
      )}
      {children}
    </div>
  )
}

export default PopMenu
