import { actions } from './model'
import * as blockActions from '../blocks/interface'

export const saveBlock = () => (dispatch, getState) => {
  const { selectedBlockId } = getState().workspace
  if (selectedBlockId) {
    dispatch(blockActions.saveCode(selectedBlockId))
  }
}

export const selectBlock = actions.selectBlock
export const toggleEnginePanelAttached = actions.toggleEnginePanelAttached
