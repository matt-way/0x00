/** @jsxImportSource theme-ui */
import { useState, useEffect, useCallback } from 'react'
import ReactFlow, {
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
  useKeyPress,
} from 'react-flow-renderer'
import { FlexBox } from 'components/system'
import { useBlock } from 'state/blocks/hooks'

import Block from './block'
import Link from './link'

const nodeTypes = {
  block: Block,
}

const edgeTypes = {
  link: Link,
}

const GraphRenderer = props => {
  const { program, programActions, selectedBlockId, activeLinks } = props
  const { blocks } = program

  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])

  // override deletion to only work with nodes
  const deleteKeyPressed = useKeyPress(['Delete', 'Backspace'])
  useEffect(() => {
    const selectedEdge = edges.find(e => e.selected)
    if (selectedEdge) {
      const { source, sourceHandle, target, targetHandle } = selectedEdge
      programActions.removeLink(source, sourceHandle, target, targetHandle)
    }
  }, [deleteKeyPressed])

  const onNodesChange = useCallback(changes => {
    const selected = changes.find(c => c.type === 'select' && c.selected)
    if (selected) {
      // deselect all edges
      setEdges(es => es.map(e => ({ ...e, selected: false })))
    }
    setNodes(ns => applyNodeChanges(changes, ns))
  }, [])
  const onEdgesChange = useCallback(changes => {
    const selected = changes.find(c => c.type === 'select' && c.selected)
    if (selected) {
      // deselect all nodes
      setNodes(ns => ns.map(n => ({ ...n, selected: false })))
    }
    setEdges(es => applyEdgeChanges(changes, es))
  }, [])

  const onNodeDragStop = useCallback((e, params) => {
    const { id, position } = params
    programActions.updateBlockPosition(id, position.x, position.y)
  }, [])

  const onConnectStart = useCallback((e, params) => {
    setNodes(ns =>
      ns.map(n => ({
        ...n,
        data: {
          ...n.data,
          newConnection: params,
        },
      }))
    )
  }, [])

  const onConnectEnd = useCallback(params => {
    setNodes(ns =>
      ns.map(n => ({
        ...n,
        data: {
          ...n.data,
          newConnection: undefined,
        },
      }))
    )
  }, [])

  const edgeSet = []
  Object.entries(blocks).forEach(([blockId, blockInstance]) => {
    Object.entries(blockInstance.outputLinks || {}).forEach(
      ([propId, links]) => {
        links.forEach(link => {
          const targetBlockId = Object.keys(link)[0]
          const targetPropId = link[targetBlockId]
          const id = `${blockId}-${propId}-${targetBlockId}-${targetPropId}`

          edgeSet.push({
            id,
            source: blockId,
            target: targetBlockId,
            sourceHandle: propId,
            targetHandle: targetPropId,
            type: 'link',
            data: {
              active: activeLinks?.[blockId]?.[propId],
            },
          })
        })
      }
    )
  })

  // Note: The link elements need to follow the entire set of nodes,
  // hence not using a hierarchy. This is because all the nodes must exit
  // to propagate up to date link information to them.

  return (
    <FlexBox
      sx={{
        fontFamily: 'Consolas, "Courier New", monospace',
        color: 'textSecondary',
      }}>
      <ReactFlow
        fitView
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        deleteKeyCode={[]}>
        {Object.entries(blocks).map(([id, block]) => (
          <DummyBlock
            key={id}
            id={id}
            blockInstance={block}
            setNodes={setNodes}
            setEdges={setEdges}
            selected={id === selectedBlockId}
          />
        ))}
        {edgeSet.map(edge => (
          <DummyLink
            key={edge.id}
            edge={edge}
            setEdges={setEdges}
            setNodes={setNodes}
          />
        ))}
        <Controls
          showInteractive={false}
          sx={{
            boxShadow: '0 0 2px 1px rgb(255 255 255 / 8%)',
            button: {
              backgroundColor: 'surface',
              borderBottomColor: 'surfaceHigh',
              '&:hover': {
                backgroundColor: 'surfaceHigh',
              },
            },
            svg: {
              fill: 'textSecondary',
            },
          }}
        />
      </ReactFlow>
    </FlexBox>
  )
}

const DummyBlock = props => {
  const { id, blockInstance, setNodes, selected } = props
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
        },
        draggable: true,
        dragHandle: '.block-header',
        selected,
      },
    ])

    return () => {
      setNodes(ns => ns.filter(n => n.id !== id))
    }
  }, [])

  useEffect(() => {
    setNodes(ns =>
      ns.map(n => {
        if (n.id === id) {
          return {
            ...n,
            selected,
            data: {
              ...n.data,
              block,
            },
          }
        }
        return n
      })
    )
  }, [block, selected])

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

  return null
}

const DummyLink = props => {
  const { edge, setEdges, setNodes } = props

  useEffect(() => {
    setEdges(es => [...es, edge])

    return () => {
      setEdges(es => es.filter(e => e.id !== edge.id))
    }
  }, [edge.data?.active])

  useEffect(() => {
    setNodes(ns =>
      ns.map(n => {
        if (n.id === edge.target) {
          return {
            ...n,
            data: {
              ...n.data,
              incomingLinks: {
                ...n.data.incomingLinks,
                [edge.targetHandle]: true,
              },
            },
          }
        }
        return n
      })
    )

    return () => {
      setNodes(ns =>
        ns.map(n => {
          if (n.id === edge.target) {
            return {
              ...n,
              data: {
                ...n.data,
                incomingLinks: {
                  ...n.data.incomingLinks,
                  [edge.targetHandle]: false,
                },
              },
            }
          }
          return n
        })
      )
    }
  }, [])

  return null
}

export default GraphRenderer
