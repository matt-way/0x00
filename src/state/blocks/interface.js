import { actions } from './model'
import prettier from 'prettier/standalone'
import parserBabel from 'prettier/parser-babel'
import defaultSettings from '../settings/definitions'

export const updateCode = actions.updateCode
export const saveCode = blockId => (dispatch, getState) => {
  const { settings, blocks } = getState()
  const block = blocks[blockId]
  const formattedCode = prettier.format(block.hotcode, {
    ...defaultSettings.prettier,
    ...settings.prettier,
    parser: 'babel',
    plugins: [parserBabel],
  })
  dispatch(actions.persistCode(blockId, formattedCode))
}

export const createProperty = (blockId, name, property) => dispatch => {
  dispatch(actions.createProperty(blockId, name, property))
  return name
}
export const updateProperty = actions.updateProperty
export const removeProperty = actions.removeProperty
export const unlock = actions.unlock
