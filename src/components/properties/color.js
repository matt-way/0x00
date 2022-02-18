/** @jsxImportSource theme-ui */
import { useState } from 'react'
import { SketchPicker } from 'react-color'
import { useClickOutside } from 'utils/hooks'

const Color = props => {
  const { id, value, updateValue } = props
  const [showPicker, setShowPicker] = useState(false)

  const ref = useClickOutside(e => {
    e.stopPropagation()
    setShowPicker(false)
  })

  return (
    <div>
      <span
        sx={{
          marginRight: '8px',
        }}>
        {id}
      </span>
      <div
        sx={{
          display: 'inline-block',
          backgroundColor: value,
          border: '1px solid #424242',
          width: '40px',
          height: '15px',
          verticalAlign: 'middle',
          borderRadius: '3px',
        }}
        onClick={e => {
          e.preventDefault()
          e.stopPropagation()
          setShowPicker(true)
        }}>
        {showPicker && (
          <SketchPicker
            ref={ref}
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
            color={value}
            onChangeComplete={color => updateValue(color.hex)}
          />
        )}
      </div>
    </div>
  )
}

export default Color
