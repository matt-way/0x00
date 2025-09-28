import * as channels from 'electron-redux-ipc/channels'

import ipcConstants from 'ipc/constants'
import { ipcRenderer } from 'electron'

// this takes all our ipc channels and turns them into callable
// invoke functions. The electron guides promote not exposing the
// invoke function directly, which is adhered to here, but seems
// unlikely as a security issue either way.
const bridgeFuncs = {}
Object.keys(ipcConstants).forEach(type => {
  const channels = ipcConstants[type]
  Object.values(channels).forEach(channel => {
    bridgeFuncs[channel] = (...args) => {
      return ipcRenderer.invoke(channel, ...args)
    }
  })
})

window.ipcInvoke = bridgeFuncs

// in order for the redux ipc to work correctly, ipcRenderer needs to exposed
window.electronReduxIPC = {
  onMainAction: func =>
    ipcRenderer.on(channels.action, (e, action) => func(action)),
  sendAction: action => ipcRenderer.send(channels.action, action),
  getInitialState: () => ipcRenderer.invoke(channels.initialState),
}

// file properties require a custom solution for access
window.properties = {
  selectFile: blockPath =>
    ipcRenderer.invoke(ipcConstants.properties.selectFile, blockPath),
}
