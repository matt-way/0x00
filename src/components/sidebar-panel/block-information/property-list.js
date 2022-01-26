/** @jsxImportSource theme-ui */
import { useState } from 'state-management/hooks'
import { useBlock } from 'state/blocks/hooks'
import Property from './property'
import EditProperty from './edit-property'

const PropertyList = props => {
  const { blockId } = props
  const [block, blockActions] = useBlock(blockId)
  const { properties, propertyOrder } = block.config.block
  const [adding, setAdding] = useState(false)

  return (
    <div
      sx={{
        padding: [5],
        borderBottom: '2px solid',
        borderBottomColor: 'background',
      }}>
      <div>Properties</div>
      {propertyOrder.map(propName => {
        const property = properties[propName]
        return (
          <Property
            key={propName}
            name={propName}
            propertyConfig={property}
            usedNames={propertyOrder}
            updateProperty={blockActions.updateProperty}
            removeProperty={blockActions.removeProperty}
          />
        )
      })}
      <div
        sx={{
          display: 'flex',
        }}>
        <button onClick={() => setAdding(true)}>Add</button>
        {adding && (
          <EditProperty
            usedNames={propertyOrder}
            focusOnMount={true}
            onClose={() => setAdding(false)}
            onSave={(name, property) => {
              blockActions.createProperty(name, property)
              setAdding(false)
            }}
          />
        )}
      </div>
    </div>
  )
}

export default PropertyList
