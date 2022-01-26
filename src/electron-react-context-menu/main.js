import { ipcMain, Menu } from 'electron'
import { channels } from './constants'

const initContextMenu = () => {
  ipcMain.on(channels.open, (event, menuDef) => {
    const template = menuDef.map(item => {
      if (item.click) {
        return {
          ...item,
          click: () => event.reply(channels.item, item.click),
        }
      }
      return item
    })

    const menu = Menu.buildFromTemplate(template)
    menu.popup({
      callback: () => event.reply(channels.close),
    })
  })
}

export { initContextMenu }
