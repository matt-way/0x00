import { combineReducers } from 'redux'
import { reducer as settingsReducer } from './settings/model'
import { reducer as programReducer } from './program/model'
import { reducer as workspaceReducer } from './workspace/model'
import { reducer as loadersReducer } from './loaders/model'
import { reducer as modalsReducer } from './modals/model'
import { reducer as statusBarReducer } from './status-bar/model'
import { reducer as statusReducer } from './statuses/model'
import { reducer as toastsReducer } from './toasts/model'
import { reducer as blocksReducer } from './blocks/model'

const reducer = combineReducers({
  settings: settingsReducer,
  program: programReducer,
  workspace: workspaceReducer,
  loaders: loadersReducer,
  modals: modalsReducer,
  statusBar: statusBarReducer,
  statuses: statusReducer,
  toasts: toastsReducer,
  blocks: blocksReducer,
})

export default reducer
