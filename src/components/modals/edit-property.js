/** @jsxImportSource theme-ui */
import { useState } from 'state-management/hooks'
import { useBlock } from 'state/blocks/hooks'
import { useProgramActions } from 'state/program/hooks'
import { Fragment } from 'react'
import { PopMenu, Button, Select, Input } from 'components/system'
import { typeMap } from 'components/properties'

const EditProperty = props => {
  const {
    left,
    top,
    close,
    blockId,
    propId,
    focusOnMount = true,
    linkSourceId,
  } = props
  const [block, blockActions] = useBlock(blockId)
  const programActions = useProgramActions()

  const blockConfig = block.config.block
  const { properties, propertyOrder } = blockConfig
  const propertyConfig = propId ? properties[propId] : {}

  const [nameValue, setNameValue] = useState(propId || linkSourceId || '')
  const [dataType, setDataType] = useState(propertyConfig.type || 'generic')

  const onClose = () => {
    close()
    if (linkSourceId) {
      programActions.cancelLinkDragDrop()
    }
  }

  return (
    <PopMenu
      left={left}
      top={top}
      onClose={onClose}
      title={propId ? 'Edit Property' : 'Create Property'}
      sx={{
        minWidth: '200px',
      }}>
      <div
        sx={{
          display: 'flex',
          flexDirection: 'row',
          marginBottom: '4px',
        }}>
        <div sx={{ flex: 1 }}>Name</div>
        <Input
          value={nameValue}
          onChange={e => setNameValue(e.target.value)}
          sx={{
            flex: 1.5,
            color:
              propertyOrder.indexOf(nameValue) >= 0 && nameValue !== propId
                ? 'red'
                : undefined,
          }}
          focusOnMount={focusOnMount}
        />
      </div>
      <div
        sx={{
          display: 'flex',
          flexDirection: 'row',
          marginBottom: '8px',
        }}>
        <div
          sx={{
            flex: 1,
          }}>
          Data Type
        </div>
        <Select
          sx={{
            flex: 1.5,
          }}
          options={Object.keys(typeMap).map(t => ({
            key: t,
            text: typeMap[t].label,
          }))}
          value={dataType}
          onChange={event => {
            setDataType(event.target.value)
          }}
        />
        {/*<div>Custom Options Per Data Type</div>*/}
      </div>
      <div
        sx={{
          textAlign: 'right',
        }}>
        <Button
          onClick={async e => {
            const newConfig = {
              ...propertyConfig,
            }

            if (dataType !== 'generic') {
              newConfig.type = dataType
            } else {
              delete newConfig.type
            }

            close() // close first to avoid propId changes crashing

            if (propId) {
              await blockActions.updateProperty(nameValue, propId, newConfig)
            } else {
              await blockActions.createProperty(nameValue, newConfig)
            }

            if (linkSourceId) {
              programActions.linkDrop(blockId, nameValue, false)
            }
          }}>
          {propId ? 'Save' : 'Create'}
        </Button>
        <Button
          sx={{
            marginLeft: '4px',
          }}
          onClick={onClose}>
          Cancel
        </Button>
      </div>
    </PopMenu>
  )
}

export default EditProperty
