import thunk from 'redux-thunk'
import { reducer } from 'state'
import {
  getInitialState,
  forwardActionsToMain,
  handleMainActions,
} from 'electron-redux-ipc/renderer'
import { createStore as _createStore, applyMiddleware, compose } from 'redux'

let _store

async function createStore() {
  const initialState = await getInitialState()

  const composeEnhancers =
    (typeof window !== 'undefined' &&
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
    compose
  const enhancer = composeEnhancers(
    applyMiddleware(thunk, forwardActionsToMain)
  )
  const store = _createStore(reducer, initialState, enhancer)
  handleMainActions(store)
  _store = store
  return _store
}

function getStore() {
  if (!_store) {
    throw new Error('Store has not been initialised')
  }
  return _store
}

export { createStore, getStore }
