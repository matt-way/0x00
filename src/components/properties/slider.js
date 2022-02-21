/** @jsxImportSource theme-ui */
import { Form, FormItem } from 'components/form'
import { Input } from 'components/system'

const Slider = props => {
  const { id, blockId, config, value, updateValue } = props
  const { settings = {} } = config
  const { min = 0, max = 1, defaultValue = 0 } = settings

  const percent = ((value ?? defaultValue) / (max - min) + min) * 100

  return (
    <div
      sx={{
        width: '100%',
        background: `linear-gradient(90deg, #2f5b93 ${percent}%, #393939 ${percent}%)`,
        padding: '3px 5px',
        borderRadius: '5px',
        cursor: 'pointer',
      }}
      onClick={e => {
        const ratio = e.nativeEvent.offsetX / e.target.clientWidth
        updateValue(ratio * (max - min) + min)
      }}>
      {id} - {value?.toFixed(2)}
    </div>
  )
}

Slider.settings = props => {
  const { settings = {}, updateSettings } = props

  return (
    <Form
      sx={{
        gridTemplateColumns: '2fr 5fr',
      }}>
      <FormItem
        label="Default"
        control={
          <Input
            type="number"
            value={settings.default ?? 0}
            onChange={e =>
              updateSettings(prev => ({
                ...prev,
                default: parseFloat(e.target.value),
              }))
            }
          />
        }
      />
      <FormItem
        label="Min"
        control={
          <Input
            type="number"
            value={settings.min ?? 0}
            onChange={e =>
              updateSettings(prev => ({
                ...prev,
                min: parseFloat(e.target.value),
              }))
            }
          />
        }
      />
      <FormItem
        label="Max"
        control={
          <Input
            type="number"
            value={settings.max ?? 1}
            onChange={e =>
              updateSettings(prev => ({
                ...prev,
                max: parseFloat(e.target.value),
              }))
            }
          />
        }
      />
    </Form>
  )
}

export default Slider
