/** @jsxImportSource theme-ui */
import { Input } from 'components/system'

const Number = props => {
  const { id, blockId, config, value = 0, updateValue } = props
  return (
    <div
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        'input::-webkit-outer-spin-button, input::-webkit-inner-spin-button': {
          WebkitAppearance: 'none',
          margin: 0,
        },
      }}>
      <div>{id}</div>
      <Input
        sx={{
          width: '50px',
          fontFamily: 'inherit',
          borderRadius: '5px',
        }}
        type="number"
        value={value}
        onChange={e => {
          updateValue(e.target.valueAsNumber)
        }}
        onClick={e => {
          e.target.select()
        }}
      />
    </div>
  )
}

export default Number
