if (!window.electronReduxIPC) {
  console.error('window.electronReduxIPC is not available.')
}

const getInitialState = () => {
  return window.electronReduxIPC.getInitialState()
}

const forwardActionsToMain = () => next => action => {
  if (!action.type.startsWith('@@') && !action.fromMain) {
    window.electronReduxIPC.sendAction(action)
  }
  return next(action)
}

const handleMainActions = store => {
  window.electronReduxIPC.onMainAction(action => {
    store.dispatch({
      ...action,
      fromMain: true,
    })
  })
}

export { getInitialState, forwardActionsToMain, handleMainActions }
