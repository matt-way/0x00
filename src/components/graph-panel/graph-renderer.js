/** @jsxImportSource theme-ui */
import React, { useState, useEffect, useCallback } from 'react'
import ReactFlow, { Controls, applyNodeChanges } from 'react-flow-renderer'
import { FlexBox } from 'components/system'

import Block from './block'

const nodeTypes = {
  block: Block,
}

const GraphRenderer = props => {
  const { program, programActions } = props
  const { blocks } = program
  const externalNodes = Object.entries(blocks).map(([id, block]) => ({
    id,
    type: 'block',
    position: { x: block.x, y: block.y },
    data: block,
    draggable: true,
    dragHandle: '.block-header',
  }))

  const externalEdges = []
  for (const [blockId, blockInstance] of Object.entries(blocks)) {
    const { outputLinks = {} } = blockInstance
    Object.entries(outputLinks).forEach(([propId, links]) => {
      links.forEach(link => {
        const targetBlockId = Object.keys(link)[0]
        const targetPropId = link[targetBlockId]
        externalEdges.push({
          id: `${blockId}-${propId}-${targetBlockId}-${targetPropId}`,
          source: blockId,
          target: targetBlockId,
          sourceHandle: propId,
          targetHandle: targetPropId,
        })
      })
    })
  }

  // allow external changes to our state to update the flow graph
  useEffect(() => {
    console.log('updating from redux change')
    setNodes(externalNodes)
    setEdges(externalEdges)
  }, [program, blocks])

  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])

  const onNodesChange = useCallback(changes => {
    setNodes(ns => applyNodeChanges(changes, ns))
  }, [])
  const onEdgesChange = useCallback(changes => {
    setEdges(es => applyEdgeChanges(changes, es))
  }, [])

  const onNodeDragStop = useCallback((e, params) => {
    const { id, position } = params
    programActions.updateBlockPosition(id, position.x, position.y)
  }, [])

  return (
    <FlexBox
      sx={{
        fontFamily: 'Consolas, "Courier New", monospace',
        color: 'textSecondary',
      }}>
      <ReactFlowWrapper
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}>
        <Controls showInteractive={false} />
      </ReactFlowWrapper>
    </FlexBox>
  )
}

const ReactFlowWrapper = React.memo(props => {
  console.log('rerendering flow')
  return <ReactFlow {...props} />
})

export default GraphRenderer
