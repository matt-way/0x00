/** @jsxImportSource theme-ui */

const Textarea = props => {
  return (
    <textarea
      sx={{
        color: 'textSecondary',
        backgroundColor: 'inputBackground',
        border: 'none',
        outline: 'none',
        borderRadius: '3px',
        width: '100%',
        resize: 'vertical',
        padding: '4px',
      }}
      rows="3"
      {...props}
    />
  )
}

export default Textarea
