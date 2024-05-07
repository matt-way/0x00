/** @jsxImportSource theme-ui */

import { Button } from 'components/system'

const UpdateButton = props => {
  const { id, value, updateValue } = props
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
          updateValue(Date.now())
        }}>
        Trigger
      </Button>
    </div>
  )
}

export default UpdateButton
