/** @jsxImportSource theme-ui */
import React, { useState, useEffect, useCallback } from 'react'
import ReactFlow, { Controls, applyNodeChanges } from 'react-flow-renderer'
import { FlexBox } from 'components/system'
import { useBlock } from 'state/blocks/hooks'

import Block from './block'

const nodeTypes = {
  block: Block,
}

const GraphRenderer = props => {
  const { program, programActions, selectedBlockId } = props
  const { blocks } = program

  /*
  // allow external changes to our state to update the flow graph
  useEffect(() => {
    console.log('updating from redux change')

    const externalNodes = Object.entries(blocks).map(([id, block]) => ({
      id,
      type: 'block',
      position: { x: block.x, y: block.y },
      data: {
        blockInstance: block,
        selected: id === selectedBlockId,
      },
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

    setNodes(externalNodes)
    setEdges(externalEdges)
  }, [program, blocks, selectedBlockId])
  */

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
      {Object.entries(blocks).map(([id, block]) => (
        <DummyBlock
          key={id}
          id={id}
          blockInstance={block}
          setNodes={setNodes}
        />
      ))}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}>
        <Controls showInteractive={false} />
      </ReactFlow>
    </FlexBox>
  )
}

const DummyBlock = props => {
  const { id, blockInstance, setNodes } = props
  const [block] = useBlock(id)

  useEffect(() => {
    setNodes(ns => [
      ...ns,
      {
        id,
        type: 'block',
        position: { x: blockInstance.x, y: blockInstance.y },
        data: {
          block,
          blockInstance,
          selected: false, //id === selectedBlockId,
        },
        draggable: true,
        dragHandle: '.block-header',
      },
    ])

    return () => {
      console.log('removing dummy block', id)
      setNodes(ns => ns.filter(n => n.id !== id))
    }
  }, [])

  useEffect(() => {
    setNodes(ns =>
      ns.map(n => {
        if (n.id === id) {
          return {
            ...n,
            data: {
              ...n.data,
              block,
            },
          }
        }
        return n
      })
    )
  }, [block])

  return <>{}</>
}

export default GraphRenderer
