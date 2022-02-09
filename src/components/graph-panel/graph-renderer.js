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
          setEdges={setEdges}
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
  const { id, blockInstance, setNodes, setEdges } = props
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

  useEffect(() => {
    setNodes(ns =>
      ns.map(n => {
        if (n.id === id) {
          return {
            ...n,
            data: {
              ...n.data,
              blockInstance,
            },
          }
        }
        return n
      })
    )
  }, [blockInstance])

  return Object.entries(blockInstance.outputLinks || {}).map(
    ([propId, links]) => (
      <DummyLinkSet
        key={propId}
        blockId={id}
        propId={propId}
        links={links}
        setEdges={setEdges}
      />
    )
  )
}

const DummyLinkSet = props => {
  const { blockId, propId, links = [], setEdges } = props
  return links.map(link => {
    const targetBlockId = Object.keys(link)[0]
    const targetPropId = link[targetBlockId]
    return (
      <DummyLink
        key={`${targetBlockId}-${targetPropId}`}
        blockId={blockId}
        propId={propId}
        targetBlockId={targetBlockId}
        targetPropId={targetPropId}
        setEdges={setEdges}
      />
    )
  })
}

const DummyLink = props => {
  const { blockId, propId, targetBlockId, targetPropId, setEdges } = props
  const id = `${blockId}-${propId}-${targetBlockId}-${targetPropId}`

  useEffect(() => {
    setEdges(es => [
      ...es,
      {
        id,
        source: blockId,
        target: targetBlockId,
        sourceHandle: propId,
        targetHandle: targetPropId,
      },
    ])

    return () => {
      console.log('removing dummy link', id)
      setEdges(es => es.filter(e => e.id !== id))
    }
  }, [])

  return null
}

export default GraphRenderer
