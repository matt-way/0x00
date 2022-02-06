/** @jsxImportSource theme-ui */
import ContextMenu from 'electron-react-context-menu/renderer'

const Link = props => {
  const { id, sourceX, sourceY, targetX, targetY, removeLink } = props

  return (
    <svg
      sx={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}>
      <line
        x1={sourceX}
        y1={sourceY}
        x2={targetX}
        y2={targetY}
        stroke="#ddd"
        strokeWidth={1}
        pointerEvents="all"
      />
      <ContextMenu
        menu={[
          {
            label: 'Remove Link',
            click: async () => {
              removeLink()
            },
          },
        ]}>
        <line
          x1={sourceX}
          y1={sourceY}
          x2={targetX}
          y2={targetY}
          stroke="transparent"
          strokeWidth={10}
          pointerEvents="all"
        />
      </ContextMenu>
    </svg>
  )
}

export default Link
