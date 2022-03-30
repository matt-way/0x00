/** @jsxImportSource theme-ui */
import { Button } from 'components/system'
import { invoke } from 'ipc/renderer'

const MAX_LENGTH = 30

const fileString = str => {
  const parts = (str || '').split(/[\\\/]+/)
  const filename = parts[parts.length - 1]

  if (filename.length <= MAX_LENGTH) {
    return filename
  }

  if (filename.indexOf('.') >= 0) {
    const fileParts = filename.split('.')
    return fileParts[0].substring(0, MAX_LENGTH - 3) + '...' + fileParts[1]
  } else {
    return filename.substr(0, MAX_LENGTH - 1) + '&hellip;'
  }
}

const FileSelector = props => {
  const { id, value, updateValue, blockPath } = props
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
          const path = await invoke.properties.selectFile(blockPath)
          if (path) {
            updateValue(path)
          }
        }}>
        {value ? fileString(value) : 'Select File'}
      </Button>
    </div>
  )
}

export default FileSelector
