/** @jsxImportSource theme-ui */

const Generic = props => {
  const { id, incomingConnected, outgoingConnected } = props
  return (
    <div
      sx={{
        width: '100%',
        textAlign: outgoingConnected && !incomingConnected ? 'right' : 'left',
      }}>
      {id}
    </div>
  )
}

export default Generic
