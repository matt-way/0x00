/** @jsxImportSource theme-ui */
import { Button } from 'components/system'
import { invoke } from 'ipc/renderer'

const FileSelector = props => {
  const { id, value, updateValue } = props
  const parts = (value || '').split(/[\\\/]+/)
  return (
    <div>
      <span
        sx={{
          marginRight: '8px',
        }}>
        {id}
      </span>
      <Button
        onClick={async () => {
          const path = await invoke.properties.selectFile()
          if (path) {
            updateValue(path)
          }
        }}>
        {value ? parts[parts.length - 1] : 'Select File'}
      </Button>
    </div>
  )
}

export default FileSelector
