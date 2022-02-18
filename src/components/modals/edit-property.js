/** @jsxImportSource theme-ui */
import { useState } from 'state-management/hooks'
import { useBlock } from 'state/blocks/hooks'
import { useProgramActions } from 'state/program/hooks'
import { PopMenu, Button, Select, Input } from 'components/system'
import { Form, FormItem } from 'components/form'
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
  const [typeSettings, setTypeSettings] = useState(propertyConfig.settings)

  const TypeComponent = dataType && typeMap[dataType].component

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
      <Form
        sx={{
          gridTemplateColumns: '2fr 5fr',
        }}>
        <FormItem
          label="Name"
          control={
            <Input
              value={nameValue}
              onChange={e => setNameValue(e.target.value)}
              sx={{
                color:
                  propertyOrder.indexOf(nameValue) >= 0 && nameValue !== propId
                    ? 'red'
                    : undefined,
              }}
              focusOnMount={focusOnMount}
            />
          }
        />
        <FormItem
          label="Data Type"
          control={
            <Select
              sx={{
                width: '100%',
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
          }
        />
      </Form>
      <div
        sx={{
          width: '100%',
          height: 0,
          marginTop: '8px',
          marginBottom: '8px',
          borderTop: '1px solid #414141',
        }}
      />
      {TypeComponent && TypeComponent.settings && (
        <TypeComponent.settings
          settings={typeSettings}
          updateSettings={setTypeSettings}
        />
      )}
      <div
        sx={{
          textAlign: 'right',
          marginTop: '8px',
        }}>
        <Button
          onClick={async e => {
            const newConfig = {
              ...propertyConfig,
              settings: typeSettings,
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
