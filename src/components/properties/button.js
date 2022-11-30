/** @jsxImportSource theme-ui */
import { Button } from 'components/system'

const UpdateButton = props => {
  const { id, value = false, updateValue } = props
  return (
    <div>
      <span
        sx={{
          marginRight: '8px',
        }}>
        {id}
      </span>
      <Button
        sx={{
          fontSize: 11,
        }}
        onClick={async () => {
          updateValue(!value)
        }}>
        Trigger
      </Button>
    </div>
  )
}

export default UpdateButton
