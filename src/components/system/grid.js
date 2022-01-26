/** @jsxImportSource theme-ui */

const Grid = props => {
  const { columns, rows, sx, ...rest } = props
  return (
    <div
      sx={{
        display: 'grid',
        height: '100%',
        gridTemplateColumns: columns,
        gridTemplateRows: rows,
        ...sx,
      }}
      {...rest}
    />
  )
}

export default Grid
