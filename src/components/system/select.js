/** @jsxImportSource theme-ui */

const Select = props => {
  const { options, ...rest } = props
  return (
    <select
      sx={{
        backgroundColor: 'inputBackground',
        color: 'textSecondary',
        outline: 'none',
        border: 'none',
        padding: '3px 3px',
        borderRadius: '3px',
      }}
      {...rest}>
      {options.map(option => (
        <option key={option.key} value={option.key}>
          {option.text}
        </option>
      ))}
    </select>
  )
}

export default Select
