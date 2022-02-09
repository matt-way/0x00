/** @jsxImportSource theme-ui */
import { getBezierPath, getMarkerEnd } from 'react-flow-renderer'

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  arrowHeadType,
  markerEndId,
}) {
  const edgePath = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })
  //const markerEnd = getMarkerEnd(arrowHeadType, markerEndId)
  console.log('rendering edge')
  return (
    <>
      <path
        id={id}
        style={{
          stroke: 'red',
        }}
        className="react-flow__edge-path"
        d={edgePath}
        //markerEnd={markerEnd}
      />
    </>
  )
}
