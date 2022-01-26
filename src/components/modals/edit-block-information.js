/** @jsxImportSource theme-ui */
import { useState } from 'state-management/hooks'
import { useBlock } from 'state/blocks/hooks'
import { Button, Input, Textarea, Tags, PopMenu } from 'components/system'
import { invoke } from 'ipc/renderer'
import { Form, FormItem, FormActions } from 'components/form'

const EditBlockInformation = props => {
  const { left, top, close, blockId, usedNames = [] } = props
  const [block] = useBlock(blockId)
  const [name, setName] = useState(block.name || '')
  const [version, setVersion] = useState(block.config.version || '')
  const [tags, setTags] = useState(block.config.tags || [])
  const [description, setDescription] = useState(block.config.description || '')

  return (
    <PopMenu
      left={left}
      top={top}
      onClose={() => close()}
      title={`Edit ${block.name}`}
      sx={{
        minWidth: '200px',
      }}>
      <Form
        sx={{
          width: '300px',
          gridTemplateColumns: '2fr 5fr',
        }}>
        <FormItem
          label="Name"
          control={
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              sx={{
                color:
                  usedNames.indexOf(name) >= 0 && name.length > 0
                    ? 'red'
                    : undefined,
                flex: 1.5,
              }}
              focusOnMount={true}
            />
          }
        />
        <FormItem
          label="Version"
          control={
            <Input value={version} onChange={e => setVersion(e.target.value)} />
          }
        />
        <FormItem
          label="Tags"
          control={<Tags value={tags} onChange={newTags => setTags(newTags)} />}
        />
        <FormItem
          label="Description"
          control={
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          }
        />
        <FormActions sx={{ textAlign: 'right' }}>
          <Button
            onClick={async () => {
              await invoke.blocks.updateInfo(blockId, {
                name,
                version,
                description,
                tags,
              })
              close()
            }}>
            Save
          </Button>
          <Button sx={{ marginLeft: '4px' }} onClick={() => close()}>
            Cancel
          </Button>
        </FormActions>
      </Form>
    </PopMenu>
  )
}

export default EditBlockInformation
