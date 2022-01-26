import { ipcMain } from 'electron'

const handle = (channel, handler) => {
  return ipcMain.handle(channel, (e, ...args) => {
    return handler(...args)
  })
}

export { handle }
