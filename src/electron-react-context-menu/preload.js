import { channels } from './constants'
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('contextMenuIPC', {
  onItem: cb => ipcRenderer.on(channels.item, cb),
  removeItem: cb => ipcRenderer.removeAllListeners(channels.item),
  onceClose: cb => ipcRenderer.once(channels.close, cb),
  sendOpen: cb => ipcRenderer.send(channels.open, cb),
})
