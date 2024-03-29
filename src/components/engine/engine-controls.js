/** @jsxImportSource theme-ui */
import { useRef } from 'react'
import { ToolbarButton, Icon, Flex } from 'components/system'
import { useProgram } from 'state/program/hooks'
import { useWorkspace } from 'state/workspace/hooks'
import { useModalActions } from 'state/modals/hooks'
import { modalIds } from 'state/modals/model'

const EngineControls = props => {
  const { className, rounded } = props
  const [program, programActions] = useProgram()
  const [workspace, workspaceActions] = useWorkspace()
  const modalActions = useModalActions()

  return (
    <div
      sx={{
        backgroundColor: 'surface',
        marginTop: workspace.enginePanelAttached ? '3px' : '0px',
        borderRadius: '5px 5px 0px 0px',
        borderBottomWidth: '2px',
        borderBottomStyle: 'solid',
        borderBottomColor: 'surfaceLowest',
        display: 'flex',
        alignItems: 'center',
      }}
      className={className}>
      <ToolbarButton
        sx={{
          borderRadius: rounded ? '5px 0px 0px 0px' : '0px',
          padding: '5px 12px',
        }}
        onClick={() => {
          programActions.toggleRunning()
        }}>
        {program.engineRunning ? (
          <Icon type="pause" size={18} />
        ) : (
          <Icon type="play" size={18} />
        )}
      </ToolbarButton>
      <ToolbarButton
        sx={{
          padding: '5px 12px',
          fontSize: '13px',
        }}
        onClick={() => {
          programActions.reloadEngine()
        }}>
        Reset
      </ToolbarButton>
      <ToolbarButton
        onClick={() => {
          modalActions.open(modalIds.programSettings)
        }}>
        <Flex>
          <Icon type="settings" size={18} />
        </Flex>
      </ToolbarButton>
      <ToolbarButton
        sx={{
          marginLeft: 'auto',
          borderLeftWidth: '2px',
          borderLeftStyle: 'solid',
          borderLeftColor: 'surfaceLowest',
          padding: '5px 12px',
        }}
        onClick={() => {
          workspaceActions.toggleEnginePanelAttached()
        }}>
        {workspace.enginePanelAttached ? (
          <Icon size={18} type="dockWindow" />
        ) : (
          <Icon size={18} type="dockRight" />
        )}
      </ToolbarButton>
    </div>
  )
}

export default EngineControls
