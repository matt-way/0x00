/** @jsxImportSource theme-ui */
import { ToolbarButton, Icon } from 'components/system'

const EditorToolbar = props => {
  const { block, blockActions } = props
  const blockConfig = block?.config?.block || {}

  return (
    <div
      sx={{
        backgroundColor: 'surface',
        borderBottomWidth: blockConfig.showChat ? '0px' : '2px',
        borderBottomStyle: 'solid',
        borderBottomColor: 'surfaceLowest',
        borderRadius: '5px 5px 0px 0px',
        fontSize: '12px',
        //padding: '5px',
      }}>
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
    </div>
  )
}

export default EditorToolbar
