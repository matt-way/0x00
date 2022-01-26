import thunk from 'redux-thunk'
import { createStore, applyMiddleware, compose } from 'redux'
import { reducer } from 'state'
import {
  forwardActionsToRenderers,
  handleRendererRequests,
} from 'electron-redux-ipc/main'
import { startWatcher } from 'state-management/watcher'
import { readSettingsSync } from './settings'

const initialState = {
  settings: readSettingsSync(),
}

const enhancer = compose(applyMiddleware(thunk, forwardActionsToRenderers))
const store = createStore(reducer, initialState, enhancer)

handleRendererRequests(store)
startWatcher(store)

export default store
