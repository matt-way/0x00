/** @jsxImportSource theme-ui */

import { FileInput, Flex } from 'components/system'
import { Form, FormItem } from 'components/form'

import { invoke } from 'ipc/renderer'
import { useProgram } from 'state/program/hooks'

const StateSettings = props => {
  const { blockId } = props
  const [program, programActions] = useProgram()

  return (
    <div
      sx={{
        padding: [5],
        borderBottom: '2px solid',
        borderBottomColor: 'background',
      }}>
      <div>State Settings</div>
      <Flex
        sx={{
          flex: 1,
          flexDirection: 'column',
          marginTop: '10px',
        }}>
        <Form>
          <FormItem
            label="Load on Reset"
            control={
              <FileInput
                readOnly={true}
                value={
                  program?.config?.blocks?.[blockId]?.autoloadStatePath || ''
                }
                onClick={async () => {
                  const path = await invoke.properties.selectFile(program.path)
                  if (path) {
                    programActions.updateAutoloadStatePath(blockId, path)
                  }
                }}
                onClear={() => {
                  programActions.updateAutoloadStatePath(blockId)
                }}
              />
            }
          />
        </Form>
      </Flex>
    </div>
  )
}

export default StateSettings
