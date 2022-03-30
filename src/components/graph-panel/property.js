/** @jsxImportSource theme-ui */
import { useRef } from 'react'
import { typeMap } from '../properties'
import { useModalActions } from 'state/modals/hooks'
import { useProgramActions } from 'state/program/hooks'
import { modalIds } from 'state/modals/model'
import { Flex } from 'components/system'
import { Handle } from 'react-flow-renderer'
import ContextMenu from 'electron-react-context-menu/renderer'
import { DYNAMIC_HANDLE_ID } from './constants'

const Property = props => {
  const {
    id,
    config = {},
    value,
    blockId,
    incomingConnected,
    outgoingConnected,
    blockActions,
    blockPath,
  } = props
  const { output, type } = config
  const domRef = useRef(null)
  const modalActions = useModalActions()
  const programActions = useProgramActions()

  const propType = incomingConnected ? 'generic' : type || 'generic'
  const PropertyType = typeMap[propType].component

  return (
    <ContextMenu
      menu={[
        {
          label: 'Edit Property',
          click: () => {
            const offset = domRef.current.getBoundingClientRect()
            modalActions.openAt(
              modalIds.editProperty,
              { x: offset.left, y: offset.bottom },
              { blockId, propId: id }
            )
          },
        },
        {
          label: 'Remove Property',
          click: () => {
            blockActions.removeProperty(id)
          },
        },
        /*{
          label: 'Log Property Value',
          click: async () => {
            blockActions.remove()
          },
        },*/
      ]}>
      <Flex
        ref={domRef}
        sx={{
          position: 'relative',
          alignItems: 'center',
          height: '25px',
          padding: '0px 8px',
        }}>
        <PropertyType
          id={id}
          blockId={blockId}
          blockPath={blockPath}
          config={config}
          value={value}
          updateValue={val => {
            programActions.updatePropertyValue(blockId, id, val)
          }}
          incomingConnected={incomingConnected}
          outgoingConnected={outgoingConnected}
        />
        <Handle
          type="target"
          position="left"
          id={id}
          isConnectable={true}
          onConnect={params => {
            const { source, target, sourceHandle, targetHandle } = params
            const sourceProp =
              sourceHandle === DYNAMIC_HANDLE_ID ? undefined : sourceHandle
            if (source !== target) {
              programActions.createLink(
                source,
                sourceProp,
                target,
                targetHandle
              )
            }
          }}
          style={{
            borderColor: incomingConnected ? '#fff' : '#555',
          }}
        />
        <Handle
          type="source"
          position="right"
          id={id}
          isConnectable={true}
          onConnect={params => {
            const { source, target, sourceHandle, targetHandle } = params
            const targetProp =
              targetHandle === DYNAMIC_HANDLE_ID ? undefined : targetHandle
            if (source !== target) {
              programActions.createLink(
                source,
                sourceHandle,
                target,
                targetProp
              )
            }
          }}
          sx={{
            borderColor: outgoingConnected ? '#fff' : '#555',
          }}
        />
      </Flex>
    </ContextMenu>
  )
}

export default Property
