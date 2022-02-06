/** @jsxImportSource theme-ui */
import React from 'react'
import { useProgramActions } from 'state/program/hooks'

export const InputHub = props => {
  const { blockId, propId } = props
  const programActions = useProgramActions()

  return (
    <div
      sx={{
        position: 'absolute',
        left: '-5px',
        top: '50%',
        marginTop: '-4px',
        width: '8px',
        height: '8px',
        backgroundColor: 'hubBackground',
        borderRadius: '4px',
        border: '1px solid #000',
      }}
      onMouseDown={onDragStart}
      onMouseUp={onDrop}
    />
  )

  function onDragStart(e) {
    programActions.linkDrag(blockId, propId, false)
  }

  function onDrop(e) {
    programActions.linkDrop(blockId, propId, false)
  }
}
