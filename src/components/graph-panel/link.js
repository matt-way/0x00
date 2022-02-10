/** @jsxImportSource theme-ui */
import { getBezierPath } from 'react-flow-renderer'
//import ContextMenu from 'electron-react-context-menu/renderer'

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
}) {
  const edgePath = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })
  return (
    <>
      {/*<ContextMenu
        menu={[
          {
            label: 'Remove Link',
            click: async () => {
              console.log('removeLink()')
            },
          },
        ]}>*/}
      <path
        className="react-flow__edge-path"
        style={{
          stroke: 'transparent',
          fill: 'none',
          strokeWidth: 10,
          cursor: 'pointer',
        }}
        d={edgePath}
      />
      {/*</ContextMenu>*/}
      <path
        id={id}
        style={{
          stroke: selected ? '#f90' : '#999',
          cursor: 'pointer',
        }}
        className="react-flow__edge-path"
        d={edgePath}
      />
    </>
  )
}
