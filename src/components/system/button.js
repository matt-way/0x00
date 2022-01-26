/** @jsxImportSource theme-ui */
import { Icon } from 'components/system'

const Button = props => {
  const { icon, children, ...rest } = props

  let finalChildren = children

  if (icon) {
    finalChildren = (
      <div
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Icon sx={{ width: '18px', height: '18px' }} type={icon} />
        <div sx={{ lineHeight: '14px', padding: '0px 5px' }}>{children}</div>
      </div>
    )
  }

  return (
    <button
      sx={{
        backgroundColor: 'surface',
        color: 'textSecondary',
        border: 'none',
        '&:hover': {
          color: 'text',
          backgroundColor: 'surfaceLow',
        },
        '&:focus': {
          outline: 'none',
        },
        '&:active': {
          borderBottom: 'none',
          //paddingTop: '1px',
        },
        borderRadius: '3px',
        padding: '3px 12px',
        borderBottom: '1px solid #575757',
        cursor: 'pointer',
      }}
      {...rest}>
      {finalChildren}
    </button>
  )
}

export default Button
