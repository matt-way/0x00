/** @jsxImportSource theme-ui */
import React from 'react'

const FlexBox = React.forwardRef((props, ref) => {
  const { sx, flex = 1, ...rest } = props
  return (
    <div
      sx={{
        flex,
        ...sx,
      }}
      ref={ref}
      {...rest}
    />
  )
})

export default FlexBox
