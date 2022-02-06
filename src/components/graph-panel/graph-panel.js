/** @jsxImportSource theme-ui */
import { useState, useRef } from 'react'
import ReactFlow, { Controls } from 'react-flow-renderer'
import { useProgram } from 'state/program/hooks'
import { Flex, FlexBox } from 'components/system'
import Toolbar from './toolbar'
/*import { PropertyRefProvider } from './property-context'
import { useProgram } from 'state/program/hooks'
import { useWorkspace } from 'state/workspace/hooks'
import { Flex, FlexBox } from 'components/system'
import { BlockSet } from './block-set'
import { LinkSet } from './link-set'
import Toolbar from './toolbar'*/

import Block from './block'

const nodeTypes = {
  block: Block,
}

/*const nodes = [
  {
    id: '1',
    type: 'block',
    data: { label: 'Node 1' },
    position: { x: 250, y: 5 },
  },
  // you can also pass a React Node as a label
  {
    id: '2',
    type: 'block',
    data: { label: <div>Node 2</div> },
    position: { x: 100, y: 100 },
  },
]*/

const edges = []

const GraphPanel = props => {
  const [program, programActions] = useProgram()
  const { blocks } = program.config
  const nodes = Object.entries(blocks).map(([id, block]) => ({
    id,
    type: 'block',
    position: { x: block.x, y: block.y },
    data: block,
  }))

  const edges = []
  for (const [blockId, blockInstance] of Object.entries(blocks)) {
    const { outputLinks = {} } = blockInstance
    Object.entries(outputLinks).forEach(([propId, links]) => {
      links.forEach(link => {
        const targetBlockId = Object.keys(link)[0]
        const targetPropId = link[targetBlockId]
        edges.push({
          source: blockId,
          target: targetBlockId,
          sourceHandle: propId,
          targetHandle: targetPropId,
        })
      })
    })
  }
  console.log(edges)

  return (
    <Flex
      direction="column"
      sx={{
        height: '100%',
        userSelect: 'none',
        backgroundColor: 'surfaceHigh',
        borderRadius: '5px 5px 0px 0px',
      }}>
      <FlexBox flex={0}>
        <Toolbar />
      </FlexBox>
      {program.config && (
        <FlexBox
          sx={{
            fontFamily: 'Consolas, "Courier New", monospace',
            color: 'textSecondary',
          }}>
          <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes}>
            <Controls showInteractive={false} />
          </ReactFlow>
        </FlexBox>
      )}
    </Flex>
  )
}

export default GraphPanel
