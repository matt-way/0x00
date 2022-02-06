import React from 'react'
import Block from './block'

export const BlockSet = (props) => {
  const {
    blocks,
    selectedId,
    onUpdatePosition,
    onClick,
    onPropertyValueUpdated,
    linkDragging,
    canvasOffset,
  } = props

  return Object.entries(blocks).map(([id, blockInstance]) => (
    <Block
      key={id}
      id={id}
      instanceData={blockInstance}
      onUpdatePosition={(newPos) => {
        onUpdatePosition(id, newPos.x, newPos.y)
      }}
      selected={id === selectedId}
      onClick={() => onClick(id)}
      onPropertyValueUpdated={onPropertyValueUpdated}
      linkDragging={linkDragging}
      canvasOffset={canvasOffset}
    />
  ))
}
