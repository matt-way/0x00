import * as channels from './channels'
import { ipcMain, webContents } from 'electron'

const forwardActionsToRenderers = () => next => action => {
  if (!action.type.startsWith('@@')) {
    const { senderProcessId } = action
    webContents.getAllWebContents().forEach(wc => {
      const type = wc.getType()
      // TODO: add ability for renderer to specify whether or not to propagate an action
      // or omit certain keys from payloads, or provide a specific payload for propagation.
      // This allows us to prevent sentitive information from making it to the engine for example.
      if (
        (type === 'window' || type === 'browserView') &&
        (!senderProcessId || senderProcessId !== wc.getProcessId())
      ) {
        wc.send(channels.action, action)
      }
    })
  }
  return next(action)
}

const handleRendererRequests = store => {
  ipcMain.handle(channels.initialState, () => store.getState())

  ipcMain.on(channels.action, (event, action) => {
    store.dispatch({
      ...action,
      senderProcessId: event.processId,
    })
  })
}

export { forwardActionsToRenderers, handleRendererRequests }
