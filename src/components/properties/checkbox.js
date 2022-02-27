/** @jsxImportSource theme-ui */
import { Input } from 'components/system'

const Checkbox = props => {
  const {
    id,
    blockId,
    config,
    value = '',
    updateValue,
    incomingConnected,
    outgoingConnected,
  } = props
  return (
    <div
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent:
          outgoingConnected && !incomingConnected ? 'flex-end' : 'flex-start',
        alignItems: 'center',
      }}>
      <Input
        id={`${blockId}-${id}`}
        sx={{
          fontFamily: 'inherit',
          margin: 0,
          width: '13px',
          marginRight: '5px',
        }}
        type="checkbox"
        checked={value}
        onChange={e => {
          updateValue(e.target.checked)
        }}
      />
      <label htmlFor={`${blockId}-${id}`}>{id}</label>
    </div>
  )
}

export default Checkbox
