/** @jsxImportSource theme-ui */
import { useState, useRef } from 'react'
import { HubPositionProvider } from './hub-position-context'
import { useProgram } from 'state/program/hooks'
import { useWorkspace } from 'state/workspace/hooks'
import { Flex, FlexBox } from 'components/system'
import { BlockSet } from './block-set'
import { LinkSet } from './link-set'
import Toolbar from './toolbar'

const GraphPanel = props => {
  const [workspace, workspaceActions] = useWorkspace()
  const [program, programActions] = useProgram()
  const { config } = program
  const containerRef = useRef()

  const dragStartOffset = useRef()
  const [renderOffset, setRenderOffset] = useState({ x: 0, y: 0 })

  return (
    <HubPositionProvider>
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
        {config && (
          <FlexBox
            sx={{
              position: 'relative',
              overflow: 'hidden',
              fontFamily: 'Consolas, "Courier New", monospace',
              fontSize: '14px',
              color: 'textSecondary',
            }}
            ref={containerRef}
            onMouseDown={e => {
              var rect = containerRef.current.getBoundingClientRect()
              dragStartOffset.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
              }
            }}
            onMouseMove={e => {
              if (dragStartOffset.current) {
                var rect = containerRef.current.getBoundingClientRect()
                const xPos = e.clientX - rect.left
                const yPos = e.clientY - rect.top
                const xDelta = xPos - dragStartOffset.current.x
                const yDelta = yPos - dragStartOffset.current.y
                dragStartOffset.current = { x: xPos, y: yPos }
                setRenderOffset(prev => {
                  return {
                    x: prev.x + xDelta,
                    y: prev.y + yDelta,
                  }
                })
              }
            }}
            onMouseUp={e => {
              dragStartOffset.current = undefined
            }}>
            <LinkSet
              blocks={config.blocks}
              linkDragging={program.linkDragging}
              cancelLinkDrop={programActions.cancelLinkDragDrop}
              containerRef={containerRef}
              creatingLink={program.creatingLink}
              removeLink={programActions.removeLink}
            />
            <BlockSet
              blocks={config.blocks}
              selectedId={workspace.selectedBlockId}
              onUpdatePosition={programActions.updateBlockPosition}
              onClick={workspaceActions.selectBlock}
              onPropertyValueUpdated={programActions.updatePropertyValue}
              linkDragging={program.linkDragging}
              canvasOffset={renderOffset}
            />
          </FlexBox>
        )}
      </Flex>
    </HubPositionProvider>
  )
}

export default GraphPanel
