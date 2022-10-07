/** @jsxImportSource theme-ui */
import { useState } from 'state-management/hooks'
import { PopMenu, Button, Input } from 'components/system'
import { Form, FormItem, FormActions } from 'components/form'
import { useProgram } from 'state/program/hooks'

const ProgramOptions = props => {
  const { close, top, left } = props
  const [program, programActions] = useProgram()
  const [framesPerRAF, setFramesPerRAF] = useState(
    program.config.framesPerRAF || 1
  )

  return (
    <PopMenu
      left={left}
      top={top}
      onClose={() => close()}
      title={`Program Settings`}>
      <Form
        sx={{
          gridTemplateColumns: '2fr 5fr',
        }}>
        <FormItem
          label="Frames per RAF"
          control={
            <Input
              value={framesPerRAF}
              onChange={e => setFramesPerRAF(e.target.value)}
              focusOnMount={true}
              type="number"
              min={1}
            />
          }
        />
        <FormActions sx={{ textAlign: 'right' }}>
          <Button
            primary
            onClick={async () => {
              await programActions.updateSettings({
                framesPerRAF,
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

export default ProgramOptions
