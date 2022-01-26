/** @jsxImportSource theme-ui */
import { useState } from 'state-management/hooks'
import { useBlock } from 'state/blocks/hooks'
import { useProgramActions } from 'state/program/hooks'
import { PopMenu, Button, Input } from 'components/system'

const EditOutputProperty = props => {
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
  const [nameValue, setNameValue] = useState(propId || linkSourceId || '')

  const blockConfig = block.config.block
  const { properties, propertyOrder } = blockConfig
  const propertyConfig = propId ? properties[propId] : {}

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
      title={propId ? 'Edit Output Property' : 'Create Output Property'}
      sx={{ minWidth: '200px' }}>
      <div
        sx={{
          display: 'flex',
          flexDirection: 'row',
          marginBottom: '8px',
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
          textAlign: 'right',
        }}>
        <Button
          onClick={async () => {
            const newConfig = {
              ...propertyConfig,
              output: true,
            }

            close() // close first to avoid propId changes crashing

            if (propId) {
              await blockActions.updateProperty(nameValue, propId, newConfig)
            } else {
              await blockActions.createProperty(nameValue, newConfig)
            }

            if (linkSourceId) {
              programActions.linkDrop(blockId, nameValue, true)
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

export default EditOutputProperty
