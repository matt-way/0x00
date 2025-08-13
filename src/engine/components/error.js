const Error = props => {
  const { error } = props

  let message = '',
    parts = []
  if (error.stack) {
    ;[message, ...parts] = error.stack.split('\n')
  } else {
    message = error
  }

  const runIndex = parts.findIndex(p => p.includes('Object.run (http://blocks'))
  const stackToShow = runIndex >= 0 ? parts.slice(0, runIndex + 1) : parts

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: '#290000',
        color: '#ff8585',
        fontSize: '14px',
        fontFamily: 'monospace',
        border: '1px solid #5c0000',
      }}>
      <div style={{ padding: '10px' }}>{message}</div>
      <div style={{ padding: '0px 15px 10px 15px' }}>
        {stackToShow.map((part, index) => (
          <div key={index}>{part}</div>
        ))}
      </div>
    </div>
  )
}

export default Error
