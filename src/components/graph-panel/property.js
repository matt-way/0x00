/** @jsxImportSource theme-ui */
import { useRef } from 'react'
import { typeMap } from '../properties'
import { useModalActions } from 'state/modals/hooks'
import { useProgramActions } from 'state/program/hooks'
import { modalIds } from 'state/modals/model'
import { Flex } from 'components/system'
import { Handle } from 'react-flow-renderer'
import ContextMenu from 'electron-react-context-menu/renderer'

const Property = props => {
  const { id, config = {}, value, blockId, updateValue, blockActions } = props
  const { output, type } = config
  const domRef = useRef(null)
  const modalActions = useModalActions()
  const programActions = useProgramActions()

  const PropertyType = typeMap[type || 'generic'].component

  return (
    <ContextMenu
      menu={[
        {
          label: 'Edit Property',
          click: () => {
            const offset = domRef.current.getBoundingClientRect()
            modalActions.openAt(
              output ? modalIds.editOutputProperty : modalIds.editInputProperty,
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
          config={config}
          value={value}
          updateValue={val => {
            programActions.updatePropertyValue(blockId, id, val)
          }}
        />
        <Handle
          type="target"
          position="left"
          id={id}
          isConnectable={true}
          onConnect={params => {
            const { source, target, sourceHandle, targetHandle } = params
            if (source !== target) {
              programActions.createLink(
                source,
                sourceHandle,
                target,
                targetHandle
              )
            }
          }}
        />
        <Handle
          type="source"
          position="right"
          id={id}
          isConnectable={true}
          onConnect={params => {
            const { source, target, sourceHandle, targetHandle } = params
            if (source !== target) {
              programActions.createLink(
                source,
                sourceHandle,
                target,
                targetHandle
              )
            }
          }}
        />
      </Flex>
    </ContextMenu>
  )
}

export default Property
