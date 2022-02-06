import React, { useRef, useEffect, useCallback } from 'react'
import Link from './link'
import { get } from 'lodash'
import { useHubPositions } from './hub-position-context'
import { useRafRerender } from 'utils/hooks'

export const LinkSet = props => {
  const {
    blocks,
    linkDragging,
    cancelLinkDrop,
    containerRef,
    creatingLink,
    removeLink,
  } = props
  const hubPositions = useHubPositions()
  const rafRerender = useRafRerender()
  const dragCoordinates = useRef()

  const onLinkDrag = useCallback(
    e => {
      if (containerRef.current && !creatingLink) {
        var rect = containerRef.current.getBoundingClientRect()
        dragCoordinates.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        }
        rafRerender()
      }
    },
    [creatingLink]
  )

  const onLinkDragEnd = useCallback(
    e => {
      document.removeEventListener('mousemove', onLinkDrag)
      document.removeEventListener('mouseup', onLinkDragEnd)
      dragCoordinates.current = null
      cancelLinkDrop()
    },
    [onLinkDrag]
  )

  useEffect(() => {
    if (linkDragging && !creatingLink) {
      document.addEventListener('mousemove', onLinkDrag)
      document.addEventListener('mouseup', onLinkDragEnd)
    }
    return () => {
      document.removeEventListener('mousemove', onLinkDrag)
      document.removeEventListener('mouseup', onLinkDragEnd)
    }
  }, [linkDragging, creatingLink, onLinkDrag])

  const links = Object.entries(blocks).reduce(
    (acc, [blockId, blockInstance]) => {
      if (!blockInstance.outputLinks) {
        return acc
      }

      Object.entries(blockInstance.outputLinks).forEach(([propId, links]) => {
        links.forEach(link => {
          const targetBlockId = Object.keys(link)[0]
          const targetPropId = link[targetBlockId]
          const sourcePos = get(hubPositions, `${blockId}.${propId}`)
          const targetPos = get(
            hubPositions,
            `${targetBlockId}.${targetPropId}`
          )
          const id = `${targetBlockId}-${targetPropId}`
          if (sourcePos && targetPos) {
            acc.push({
              id,
              sourceX: sourcePos.x,
              sourceY: sourcePos.y,
              targetX: targetPos.x,
              targetY: targetPos.y,
              removeLink: () => {
                removeLink(blockId, propId, targetBlockId, targetPropId)
              },
            })
          }
        })
      })

      return acc
    },
    []
  )

  if (linkDragging && dragCoordinates.current) {
    const { sourceBlockId, sourcePropId } = linkDragging
    const sourcePos = get(hubPositions, `${sourceBlockId}.${sourcePropId}`)
    links.push({
      id: '--new-link',
      sourceX: sourcePos.x,
      sourceY: sourcePos.y,
      targetX: dragCoordinates.current.x,
      targetY: dragCoordinates.current.y,
    })
  }

  return links.map(link => <Link key={link.id} {...link} />)
}
