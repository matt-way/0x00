/** @jsxImportSource theme-ui */
import { useRef, useCallback } from 'react'
import { useRafRerender } from 'utils/hooks'
import { useBlock } from 'state/blocks/hooks'
import { useModalActions } from 'state/modals/hooks'
import { useProgramActions } from 'state/program/hooks'
import { modalIds } from 'state/modals/model'
import { Icon } from 'components/system'
import Property from './property'
import ContextMenu from 'electron-react-context-menu/renderer'
import { invoke } from 'ipc/renderer'

const Block = props => {
  const {
    id,
    instanceData,
    onUpdatePosition,
    propsRef,
    selected,
    onClick,
    onPropertyValueUpdated,
    linkDragging,
    canvasOffset,
  } = props
  const { x, y, inputValues = {} } = instanceData
  const [block, blockActions] = useBlock(id)
  const modalActions = useModalActions()
  const programActions = useProgramActions()
  const inputCreatorRef = useRef()
  const outputCreatorRef = useRef()

  if (!block) {
    return null
  }

  const { config = {} } = block
  const blockConfig = config.block || {}
  const { properties = {}, propertyOrder = [] } = blockConfig

  const rafRerender = useRafRerender()
  const dragStart = useRef()
  const dragDelta = useRef({ x: 0, y: 0 })

  const onMouseDown = e => {
    e.preventDefault()
    e.stopPropagation()
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
    }
    document.addEventListener('mousemove', onDrag)
    document.addEventListener('mouseup', onMouseUp)
  }

  const onDrag = useCallback(e => {
    if (dragStart.current) {
      dragDelta.current.x = e.clientX - dragStart.current.x
      dragDelta.current.y = e.clientY - dragStart.current.y
      rafRerender()
    }
  }, [])

  const onMouseUp = useCallback(e => {
    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('mouseup', onMouseUp)
    // the delta needs to be reset before calling onupdate so that
    // a rerender doesn't use the older delta values
    const { x, y } = dragDelta.current
    dragDelta.current.x = 0
    dragDelta.current.y = 0
    onUpdatePosition({ x, y })
  }, [])

  const renderX = x + dragDelta.current.x + canvasOffset.x
  const renderY = y + dragDelta.current.y + canvasOffset.y

  const newInputConnectionAvailable =
    linkDragging && linkDragging.sourceBlockId !== id && linkDragging.isOutput
  const newOutputConnectionAvailable =
    linkDragging && linkDragging.sourceBlockId !== id && !linkDragging.isOutput

  return (
    <div
      sx={{
        position: 'absolute',
        transform: `translate(${renderX}px, ${renderY}px)`,
        backgroundColor: 'blockBackground',
        boxShadow: '0px 0px 2px #1c1c1c',
        border: selected ? '2px solid #f90' : '2px solid #414141',
        borderRadius: '6px',
        minWidth: '100px',
      }}
      onMouseDown={e => e.stopPropagation()}>
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
          onMouseDown={onMouseDown}
          onClick={onClick}>
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
            propsRef={propsRef}
            config={properties[propId]}
            value={inputValues[propId]}
            blockId={id}
            blockX={renderX}
            blockY={renderY}
            updateValue={newValue =>
              onPropertyValueUpdated(id, propId, newValue)
            }
            blockActions={blockActions}
          />
        )
      })}
      <div
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '6px',
        }}>
        <div
          sx={{
            visibility: newOutputConnectionAvailable ? 'hidden' : 'visible',
            borderTop: newInputConnectionAvailable
              ? '2px solid #6eb36d'
              : '2px solid #414141',
            borderRight: newInputConnectionAvailable
              ? '2px solid #6eb36d'
              : '2px solid #414141',
            borderTopRightRadius: '5px',
          }}
          ref={inputCreatorRef}
          onClick={() => {
            const offset = inputCreatorRef.current.getBoundingClientRect()
            modalActions.openAt(
              modalIds.editInputProperty,
              { x: offset.left, y: offset.top },
              { blockId: id }
            )
          }}
          onMouseUp={
            newInputConnectionAvailable
              ? e => {
                  e.stopPropagation()
                  programActions.creatingLink(id)
                  const offset = inputCreatorRef.current.getBoundingClientRect()
                  modalActions.openAt(
                    modalIds.editInputProperty,
                    { x: offset.left, y: offset.top },
                    { blockId: id, linkSourceId: linkDragging.sourcePropId }
                  )
                }
              : undefined
          }>
          <Icon
            sx={{
              display: 'block',
              color: newInputConnectionAvailable ? '#6eb36d' : 'textSecondary',
              width: '15px',
              height: '15px',
            }}
            type="plus"
          />
        </div>
        <div
          sx={{
            visibility: newInputConnectionAvailable ? 'hidden' : 'visible',
            borderTop: newOutputConnectionAvailable
              ? '2px solid #6eb36d'
              : '2px solid #414141',
            borderLeft: newOutputConnectionAvailable
              ? '2px solid #6eb36d'
              : '2px solid #414141',
            borderTopLeftRadius: '5px',
          }}
          ref={outputCreatorRef}
          onClick={e => {
            const offset = outputCreatorRef.current.getBoundingClientRect()
            modalActions.openAt(
              modalIds.editOutputProperty,
              { x: offset.left, y: offset.top },
              { blockId: id }
            )
          }}
          onMouseUp={
            newOutputConnectionAvailable
              ? e => {
                  e.stopPropagation()
                  programActions.creatingLink(id)
                  const offset =
                    outputCreatorRef.current.getBoundingClientRect()
                  modalActions.openAt(
                    modalIds.editOutputProperty,
                    { x: offset.left, y: offset.top },
                    { blockId: id, linkSourceId: linkDragging.sourcePropId }
                  )
                }
              : undefined
          }>
          <Icon
            sx={{
              display: 'block',
              color: newOutputConnectionAvailable ? '#6eb36d' : 'textSecondary',
              width: '15px',
              height: '15px',
            }}
            type="plus"
          />
        </div>
      </div>
    </div>
  )
}

export default Block
