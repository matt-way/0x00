/** @jsxImportSource theme-ui */
import { useState } from 'state-management/hooks'
import { Flex } from 'components/system'
import EditProperty from './edit-property'
import ContextMenu from 'electron-react-context-menu/renderer'

const Property = props => {
  const {
    name,
    propertyConfig = {},
    usedNames,
    updateProperty,
    removeProperty,
  } = props
  const { type } = propertyConfig
  const [editing, setEditing] = useState(false)
  const [removing, setRemoving] = useState(false)

  const menu = [
    {
      label: 'Edit',
      click: () => setEditing(true),
    },
    {
      label: 'Delete',
      click: () => removeProperty(name),
    },
  ]

  return (
    <ContextMenu menu={menu}>
      <Flex>
        <div>
          {name} - {type ? type : 'generic'}
        </div>
        <div
          onClick={() => {
            setEditing(true)
          }}>
          EDIT
        </div>
        <div
          onClick={() => {
            setRemoving(true)
          }}>
          REMOVE
        </div>
        {editing && (
          <EditProperty
            name={name}
            propertyConfig={propertyConfig}
            onClose={() => setEditing(false)}
            usedNames={usedNames}
            onSave={(newName, newConfig) => {
              updateProperty(newName, name, newConfig)
              setEditing(false)
            }}
          />
        )}
        {/*removing && (
          <Confirmation
            onCancel={() => setRemoving(false)}
            onOK={() => {
              removeProperty(name, output)
              setRemoving(false)
            }}
          />
          )*/}
      </Flex>
    </ContextMenu>
  )
}

export default Property
