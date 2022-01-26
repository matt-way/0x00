/** @jsxImportSource theme-ui */
import { PopMenu, Flex, Button } from 'components/system'

const Confirmation = props => {
  const { left, top, close, title, message, okText } = props

  return (
    <PopMenu
      left={left}
      top={top}
      onClose={() => close(false)}
      sx={{
        minWidth: '200px',
        maxWidth: '350px',
      }}
      title={title ? title : 'Are you sure?'}>
      {message && (
        <div sx={{ color: 'textSecondary', marginBottom: '16px' }}>
          {message}
        </div>
      )}
      <Flex
        sx={{
          justifyContent: 'flex-end',
        }}>
        <Button onClick={() => close(true)}>{okText ? okText : 'OK'}</Button>
        <Button
          sx={{
            marginLeft: '8px',
          }}
          onClick={() => close(false)}>
          Cancel
        </Button>
      </Flex>
    </PopMenu>
  )
}

export default Confirmation
