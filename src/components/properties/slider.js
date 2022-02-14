/** @jsxImportSource theme-ui */

const Slider = props => {
  const { id, blockId, config, value = 0, updateValue } = props
  const { min = 0, max = 1 } = config
  const percent = (value / (max - min) + min) * 100
  return (
    <div
      sx={{
        background: `linear-gradient(90deg, #2f5b93 ${percent}%, #393939 ${percent}%)`,
        padding: '3px 5px',
        borderRadius: '5px',
        cursor: 'pointer',
      }}
      onClick={e => {
        const ratio = e.nativeEvent.offsetX / e.target.clientWidth
        updateValue(ratio / (max - min) + min)
      }}>
      {id} - {value.toFixed(2)}
    </div>
  )
}

export default Slider
