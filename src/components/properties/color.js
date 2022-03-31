/** @jsxImportSource theme-ui */
import { useModalActions } from 'state/modals/hooks'
import { modalIds } from 'state/modals/model'

const Color = props => {
  const { id, blockId, value, updateValue } = props
  const modalActions = useModalActions()

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
          backgroundColor: value ? value.hex : '#fff',
          border: '1px solid #424242',
          width: '40px',
          height: '15px',
          verticalAlign: 'middle',
          borderRadius: '3px',
          cursor: 'crosshair',
        }}
        onClick={e => {
          e.preventDefault()
          e.stopPropagation()
          const offset = e.currentTarget.getBoundingClientRect()
          modalActions.openAt(
            modalIds.colorPicker,
            { x: offset.left, y: offset.top },
            { blockId, propId: id }
          )
        }}
      />
    </div>
  )
}

export default Color
