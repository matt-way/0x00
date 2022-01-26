/** @jsxImportSource theme-ui */
import React from 'react'

const Flex = React.forwardRef((props, ref) => {
  const {
    direction = 'row',
    justifyContent = 'flex-start',
    alignItems = 'stretch',
    alignContent = 'center',
    fill,
    sx,
    ...rest
  } = props
  return (
    <div
      sx={{
        display: 'flex',
        height: fill ? '100%' : 'auto',
        flexDirection: direction,
        justifyContent: justifyContent,
        alignItems: alignItems,
        alignContent: alignContent,
        ...sx,
      }}
      ref={ref}
      {...rest}
    />
  )
})

export default Flex
