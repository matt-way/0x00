import { actions } from './model'

function findIdealName(name, names) {
  let i = 1
  let ideal = name
  while (names.includes(ideal)) {
    ideal = `${name}${i}`
    i++
  }
  return ideal
}

export const createLink =
  (sourceBlockId, sourcePropId, targetBlockId, targetPropId) =>
  (dispatch, getState) => {
    const { blocks } = getState()
    let newId
    if (!sourcePropId) {
      const sourceBlock = blocks[sourceBlockId]
      const { propertyOrder } = sourceBlock.config.block
      newId = sourcePropId = findIdealName(targetPropId, propertyOrder)
    } else if (!targetPropId) {
      const targetBlock = blocks[targetBlockId]
      const { propertyOrder } = targetBlock.config.block
      newId = targetPropId = findIdealName(sourcePropId, propertyOrder)
    }

    dispatch(
      actions.createLink(
        sourceBlockId,
        sourcePropId,
        targetBlockId,
        targetPropId
      )
    )
    return newId
  }

export const updateBlockPosition = actions.updateBlockPosition
export const updatePropertyValue = actions.updatePropertyValue
export const updateBlockOrder = actions.updateBlockOrder
export const removeLink = actions.removeLink
export const activateLink = actions.activateLink
export const reloadEngine = actions.reloadEngine
export const toggleRunning = actions.toggleRunning
