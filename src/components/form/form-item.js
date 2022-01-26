/** @jsxImportSource theme-ui */

const FormItem = props => {
  const { label, control } = props

  return (
    <>
      <div
        sx={{
          gridColumn: '1',
        }}>
        {label}
      </div>
      <div
        sx={{
          gridColumn: '2',
        }}>
        {control}
      </div>
    </>
  )
}

export default FormItem
