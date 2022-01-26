/** @jsxImportSource theme-ui */
import { Input } from 'components/system'

const Number = props => {
  const { id, blockId, config, value = '', updateValue } = props
  return (
    <div
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
      <div>{id}</div>
      <Input
        sx={{
          width: '50px',
          fontFamily: 'inherit',
          borderRadius: '5px',
        }}
        value={value}
        onChange={e => {
          updateValue(e.target.value)
        }}
      />
    </div>
  )
}

export default Number
