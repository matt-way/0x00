/** @jsxImportSource theme-ui */
import { useRef } from 'react'
import { useBlockActions } from 'state/blocks/hooks'
import { Handle } from 'react-flow-renderer'
import { Icon } from 'components/system'
import { useWorkspaceActions } from 'state/workspace/hooks'
import { useModalActions } from 'state/modals/hooks'
import { modalIds } from 'state/modals/model'
import Property from './property'
import ContextMenu from 'electron-react-context-menu/renderer'
import { invoke } from 'ipc/renderer'
import { DYNAMIC_HANDLE_ID } from './constants'

const Block = props => {
  const { id, data, selected } = props
  const { block, blockInstance, incomingLinks = {}, newConnection } = data
  console.log('rendering block:', id, newConnection)
  const blockActions = useBlockActions(id)
  const modalActions = useModalActions()
  const workspaceActions = useWorkspaceActions()
  const propertyCreatorRef = useRef()

  const { config = {} } = block
  const blockConfig = config.block || {}
  const { properties = {}, propertyOrder = [] } = blockConfig
  const { inputValues = {}, outputLinks = {} } = blockInstance
  const { ...vars } = newConnection || {}

  return (
    <div
      sx={{
        backgroundColor: 'blockBackground',
        boxShadow: '0px 0px 2px #1c1c1c',
        border: selected ? '2px solid #f90' : '2px solid #414141',
        borderRadius: '6px',
        minWidth: '100px',
      }}>
      <ContextMenu
        menu={[
          {
            label: 'Save State to File',
            click: () => {
              invoke.blocks.saveState(id)
            },
          },
          {
            label: 'Load State from File',
            click: () => {
              invoke.blocks.loadState(id)
            },
          },
          {
            label: 'Delete Block',
            click: async () => {
              invoke.blocks.remove(id)
            },
          },
        ]}>
        <div
          sx={{
            borderRadius: '5px 5px 0px 0px',
            backgroundColor: 'blockHeader',
            padding: '8px',
            marginBottom: '5px',
            color: 'text',
          }}
          className="block-header"
          onClick={() => {
            workspaceActions.selectBlock(id)
          }}>
          {block.config.locked && (
            <Icon
              sx={{
                width: '17px',
                height: '17px',
                marginRight: '8px',
                cursor: 'pointer',
                color: 'red',
              }}
              type="lockAlertOutline"
              onClick={async e => {
                const offset = e.currentTarget.getBoundingClientRect()
                const confirmed = await modalActions.openAt(
                  modalIds.confirmation,
                  { x: offset.left, y: offset.top },
                  {
                    title: 'Warning - Downloaded Code',
                    message:
                      'Please ensure you have read the code and dependencies before unlocking and running this downloaded block.',
                    okText: 'Unlock',
                  }
                )
                if (confirmed) {
                  blockActions.unlock()
                }
              }}
            />
          )}
          {block.name || block.config.name}
        </div>
      </ContextMenu>
      {propertyOrder.map(propId => {
        return (
          <Property
            key={propId}
            id={propId}
            config={properties[propId]}
            value={inputValues[propId]}
            blockId={id}
            updateValue={newValue =>
              onPropertyValueUpdated(id, propId, newValue)
            }
            blockActions={blockActions}
            incomingConnected={incomingLinks[propId]}
            outgoingConnected={
              outputLinks[propId] && outputLinks[propId].length > 0
            }
          />
        )
      })}
      <div
        sx={{
          display: 'flex',
          flexDirection: newConnection ? 'row' : 'column',
          justifyContent: newConnection
            ? newConnection.handleType === 'source'
              ? 'flex-start'
              : 'flex-end'
            : 'center',
          alignItems: 'center',
          marginTop: '6px',
        }}>
        {(!newConnection || newConnection.nodeId === id) && (
          <div
            sx={{
              display: 'flex',
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'center',
              borderWidth: '2px 0px 0px 0px',
              borderStyle: 'solid',
              borderColor: '#414141',
              cursor: 'pointer',
            }}
            ref={propertyCreatorRef}
            onClick={() => {
              const offset = propertyCreatorRef.current.getBoundingClientRect()
              modalActions.openAt(
                modalIds.editProperty,
                { x: offset.left, y: offset.top },
                { blockId: id }
              )
            }}>
            <Icon
              sx={{
                display: 'block',
                color: 'textSecondary',
                width: '15px',
                height: '15px',
              }}
              type="plus"
            />
          </div>
        )}
        {newConnection && newConnection.nodeId !== id && (
          <Handle
            id={DYNAMIC_HANDLE_ID}
            type={newConnection.handleType === 'source' ? 'target' : 'source'}
            position={newConnection.handleType === 'source' ? 'left' : 'right'}
            isConnectable={true}
            style={{
              position: 'relative',
              left: 0,
              transform: 'none',
              background: 'none',
              width: 'auto',
              height: 'auto',
              borderWidth:
                newConnection.handleType === 'source'
                  ? '2px 2px 0px 0px'
                  : '2px 0px 0px 2px',
              borderRadius:
                newConnection.handleType === 'source'
                  ? '0px 5px 0px 0px'
                  : '5px 0px 0px 0px',
              borderStyle: 'solid',
              borderColor: '#414141',
            }}>
            <Icon
              sx={{
                display: 'block',
                color: 'textSecondary',
                width: '15px',
                height: '15px',
                pointerEvents: 'none',
              }}
              type="plus"
            />
          </Handle>
        )}
      </div>
    </div>
  )
}

export default Block
