/** @jsxImportSource theme-ui */
import { useRef } from 'react'
import { useBlock } from 'state/blocks/hooks'
import { Handle } from 'react-flow-renderer'
import { Icon } from 'components/system'
import { useModalActions } from 'state/modals/hooks'
import Property from './property'

const Block = props => {
  const { id, data: blockInstance } = props
  const [block, blockActions] = useBlock(id)
  const modalActions = useModalActions()
  const propertyCreatorRef = useRef()

  const { config = {} } = block
  const blockConfig = config.block || {}
  const { properties = {}, propertyOrder = [] } = blockConfig
  const { inputValues = {} } = blockInstance

  const selected = false
  return (
    <div
      sx={{
        backgroundColor: 'blockBackground',
        boxShadow: '0px 0px 2px #1c1c1c',
        border: selected ? '2px solid #f90' : '2px solid #414141',
        borderRadius: '6px',
        minWidth: '100px',
      }}>
      <div
        sx={{
          borderRadius: '5px 5px 0px 0px',
          backgroundColor: 'blockHeader',
          padding: '8px',
          marginBottom: '5px',
          color: 'text',
        }}>
        {block.name || block.configname}
      </div>
      {propertyOrder.map(propId => {
        return (
          <Property
            key={propId}
            id={propId}
            //propsRef={propsRef}
            config={properties[propId]}
            value={inputValues[propId]}
            blockId={id}
            //blockX={renderX}
            //blockY={renderY}
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
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '6px',
        }}>
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
      </div>
    </div>
  )

  /*
  return (
    <>
      <Handle
        type="target"
        position="left"
        style={{ background: '#555' }}
        onConnect={params => console.log('handle onConnect', params)}
        isConnectable={true}
      />
      <div>Block</div>
      <Handle
        type="source"
        position="right"
        id="a"
        style={{ top: 10, background: '#555' }}
        isConnectable={true}
      />
      <Handle
        type="source"
        position="right"
        id="b"
        style={{ bottom: 10, top: 'auto', background: '#555' }}
        isConnectable={true}
      />
    </>
  )*/
}

export default Block
