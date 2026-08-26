/** @jsxImportSource theme-ui */
import { Flex, ToolbarButton, Icon } from 'components/system'

const EditorToolbar = props => {
  const { block, blockActions } = props
  const blockConfig = block?.config?.block || {}

  return (
    <Flex
      justifyContent="space-between"
      alignItems="stretch"
      sx={{
        backgroundColor: 'surface',
        borderBottomWidth: '2px',
        borderBottomStyle: 'solid',
        borderBottomColor: 'surfaceLowest',
        borderRadius: '5px 5px 0px 0px',
        fontSize: '12px',
        flexShrink: 0,
      }}>
      <div />
      <ToolbarButton
        sx={{
          padding: '5px 12px',
          fontSize: '13px',
          backgroundColor: blockConfig.showChat ? 'surfaceHigh' : 'surface',
        }}
        onClick={() => {
          blockActions.showChat(!blockConfig.showChat)
        }}>
        <Icon type="chat" size={18} />
      </ToolbarButton>
    </Flex>
  )
}

export default EditorToolbar
