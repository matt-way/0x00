/** @jsxImportSource theme-ui */
import { useProgram } from 'state/program/hooks'
import { PopMenu } from 'components/system'
import { SketchPicker } from 'react-color'

const ColorPicker = props => {
  const { left, top, close, blockId, propId } = props
  const [program, programActions] = useProgram()

  const blockInstance = program.config.blocks[blockId]

  return (
    <PopMenu
      clickAway
      left={left}
      top={top}
      sx={{
        padding: 0,
      }}>
      <SketchPicker
        styles={{
          default: {
            picker: {
              boxShadow: 'none',
              backgroundColor: '#1d1d1d',
            },
          },
        }}
        disableAlpha
        width={150}
        presetColors={[]}
        color={blockInstance?.inputValues?.[propId]}
        onChangeComplete={color =>
          programActions.updatePropertyValue(blockId, propId, color)
        }
      />
    </PopMenu>
  )
}

export default ColorPicker
