/** @jsxImportSource theme-ui */

import { Button, Flex, Input } from './'

const FileInput = props => {
  const { value, onClick, onClear } = props
  return (
    <Flex>
      <Input readOnly={true} value={value}></Input>
      <Button
        sx={{
          paddingLeft: '2px',
          paddingRight: '2px',
          marginLeft: '2px',
          marginRight: '2px',
        }}
        onClick={onClick}>
        ...
      </Button>
      <Button
        sx={{
          paddingLeft: '5px',
          paddingRight: '5px',
        }}
        onClick={onClear}>
        x
      </Button>
    </Flex>
  )
}

export default FileInput
