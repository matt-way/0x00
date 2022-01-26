/** @jsxImportSource theme-ui */
import Icon from './icon'

const IconButton = props => {
  return (
    <Icon
      sx={{
        color: 'textSecondary',
        '&:hover': {
          cursor: 'pointer',
          color: 'text',
        },
      }}
      {...props}
    />
  )
}

export default IconButton
