/** @jsxImportSource theme-ui */
import Button from './button'

const ToolbarButton = props => {
  return (
    <Button
      sx={{
        padding: '6px 12px',
        borderRadius: 0,
        borderRightWidth: '2px',
        borderRightStyle: 'solid',
        borderRightColor: 'surfaceLowest',
        borderBottom: 'none',
      }}
      {...props}
    />
  )
}

export default ToolbarButton
