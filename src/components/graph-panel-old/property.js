/** @jsxImportSource theme-ui */
import { useEffect, useRef } from 'react'
import { typeMap } from '../properties'
import { InputHub } from './input-hub'
import { OutputHub } from './output-hub'
import { useSetHubPosition } from './hub-position-context'
import { useModalActions } from 'state/modals/hooks'
import { modalIds } from 'state/modals/model'
import { Flex } from 'components/system'
import ContextMenu from 'electron-react-context-menu/renderer'

const Property = props => {
  const {
    id,
    config = {},
    value,
    blockId,
    blockX,
    blockY,
    updateValue,
    onDrag,
    onDrop,
    blockActions,
  } = props
  const { output, type } = config
  const domRef = useRef(null)
  const modalActions = useModalActions()

  const key = `${blockId}.${id}`
  const setHubPosition = useSetHubPosition()

  useEffect(() => {
    // whenever a prop rerenders, it tells any subscribers to rerender as well
    if (domRef.current) {
      setHubPosition(key, {
        x:
          blockX +
          domRef.current.offsetLeft +
          (output ? domRef.current.offsetWidth : 0),
        y:
          blockY + (domRef.current.offsetTop + domRef.current.offsetHeight / 2),
      })
    }
    return () => {
      setHubPosition(key)
    }
  }, [blockX, blockY])

  const InputProperty = typeMap[type || 'generic'].component

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
        {output ? (
          <>
            <div sx={{ width: '100%', textAlign: 'right' }}>{id}</div>
            <InputHub onDrop={onDrop} blockId={blockId} propId={id} />
            <OutputHub blockId={blockId} propId={id} onDrag={onDrag} />
          </>
        ) : (
          <>
            <InputProperty
              id={id}
              blockId={blockId}
              config={config}
              value={value}
              updateValue={updateValue}
            />
            <InputHub onDrop={onDrop} blockId={blockId} propId={id} />
            <OutputHub blockId={blockId} propId={id} onDrag={onDrag} />
          </>
        )}
      </Flex>
    </ContextMenu>
  )
}

export default Property
