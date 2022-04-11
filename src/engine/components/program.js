/** @jsxImportSource theme-ui */
import Block from './block'
import { useProgram } from 'state/program/hooks'
import { useWorkspace } from 'state/workspace/hooks'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import EngineControls from 'components/engine/engine-controls'

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  display: 'flex',
  border: isDragging ? '1px solid lightgreen' : 'none',
  marginBottom: '2px',
  // styles we need to apply on draggables
  ...draggableStyle,
})

const Program = props => {
  const [program, programActions] = useProgram()
  const [workspace] = useWorkspace()
  const { renderOrder = [] } = program.config || {}

  function onDragEnd(result) {
    const { source, destination, reason, draggableId } = result
    if (reason === 'DROP' && source.index !== destination.index) {
      programActions.updateBlockOrder(draggableId, destination.index)
    }
  }

  return (
    <>
      {!workspace.enginePanelAttached && (
        <EngineControls
          sx={{
            position: 'sticky',
            top: 0,
          }}
        />
      )}
      <div
        sx={{
          paddingBottom: '100px',
          backgroundColor: 'white',
          color: 'black',
        }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {renderOrder.map((blockId, index) => {
                  const selected = workspace.selectedBlockId === blockId
                  const blockError = program.blockErrors[blockId]
                  return (
                    <Draggable
                      key={blockId}
                      draggableId={blockId}
                      index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}>
                          <div
                            {...provided.dragHandleProps}
                            style={{
                              backgroundColor: selected
                                ? 'rgba(255,153,0,0.35)'
                                : '#fff',
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%23${
                                selected ? 'ff9900' : '777'
                              }' fill-opacity='1' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E")`,
                              minWidth: '15px',
                              minHeight: selected ? '10px' : '0px',
                              marginRight: '3px',
                            }}
                          />
                          <Block id={blockId} error={blockError} />
                        </div>
                      )}
                    </Draggable>
                  )
                })}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </>
  )
}

export default Program
