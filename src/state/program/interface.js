import { actions } from './model'

export const updateBlockPosition = actions.updateBlockPosition
export const updatePropertyValue = actions.updatePropertyValue
export const updateBlockOrder = actions.updateBlockOrder
export const linkDrag = actions.dragHub

export const linkDrop =
  (targetBlockId, targetPropId, isOutput) => (dispatch, getState) => {
    const { program } = getState()
    const { linkDragging } = program
    // prevent creating connections from the same types
    if (linkDragging.isOutput === isOutput) {
      return
    }
    dispatch(actions.dropHub(targetBlockId, targetPropId, isOutput))
  }

export const removeLink = actions.removeLink
export const creatingLink = actions.creatingLink
export const cancelLinkDragDrop = actions.cancelLinkDragDrop
export const reloadEngine = actions.reloadEngine
export const toggleRunning = actions.toggleRunning
