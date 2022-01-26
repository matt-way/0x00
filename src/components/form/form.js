/** @jsxImportSource theme-ui */

const Form = props => {
  const { children, ...rest } = props

  if (!children || children.length <= 0) {
    throw new Error('<Form> must have at least one child')
  }

  return (
    <div
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gridTemplateRows: `repeat(${children.length}, auto)`,
        gridGap: '5px',
        color: 'textSecondary',
      }}
      {...rest}>
      {children}
    </div>
  )
}

export default Form
