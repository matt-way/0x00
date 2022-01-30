/** @jsxImportSource theme-ui */
import { Icon } from 'components/system'

const FormHeader = props => {
  const { icon, onIconClick, children } = props

  return (
    <div
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: '8px',
      }}>
      <div sx={{ color: 'text', fontSize: '13px' }}>{children}</div>
      {icon && (
        <div onClick={onIconClick}>
          <Icon type={icon} />
        </div>
      )}
    </div>
  )
}

export default FormHeader
