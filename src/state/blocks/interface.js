import { actions } from './model'
import defaultSettings from '../settings/definitions'
import parserBabel from 'prettier/parser-babel'
import prettier from 'prettier/standalone'

export const updateCode = actions.updateCode
export const saveCode = blockId => async (dispatch, getState) => {
  const { settings, blocks } = getState()
  const block = blocks[blockId]
  try {
    const formattedCode = prettier.format(block.hotcode, {
      ...defaultSettings.prettier,
      ...settings.prettier,
      parser: 'babel',
      plugins: [parserBabel],
    })
    dispatch(actions.persistCode(blockId, formattedCode))
  } catch (e) {
    console.error(e)
    dispatch(actions.persistCode(blockId, block.hotcode))
  }
}

export const createProperty =
  (blockId, name, property = {}) =>
  dispatch => {
    dispatch(actions.createProperty(blockId, name, property))
    return name
  }
export const updateProperty = actions.updateProperty
export const removeProperty = actions.removeProperty
export const reorderPropertyAbove = actions.reorderPropertyAbove
export const reorderPropertyBelow = actions.reorderPropertyBelow
export const unlock = actions.unlock
export const saveStateComplete = actions.saveStateComplete
export const loadStateComplete = actions.loadStateComplete
export const setPaused = actions.setPaused
export const setForceRun = actions.setForceRun
export const showChat = actions.showChat
