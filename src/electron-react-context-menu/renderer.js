import React from 'react'
import { generateId } from 'utils/ids'

if (!window.contextMenuIPC) {
  console.log('Error: contextMenuIPC bridge missing')
}

const ContextMenu = props => {
  const { menu, children } = props

  const showMenu = () => {
    const instanceId = generateId()
    const clickFuncs = {}
    const menuToSend = menu.map((item, i) => {
      if (item.click) {
        const itemId = `${instanceId}-${i}`
        clickFuncs[itemId] = item.click
        return {
          ...item,
          click: itemId,
        }
      }

      return item
    })

    const itemClicked = (event, id) => {
      if (!clickFuncs[id]) {
        throw new Error(`Invalid clickfunc id for context-menu: ${id}`)
      }
      clickFuncs[id]()
    }

    const menuClosed = event => {
      contextMenuIPC.removeItem()
    }

    contextMenuIPC.onItem(itemClicked)
    contextMenuIPC.onceClose(menuClosed)
    contextMenuIPC.sendOpen(menuToSend)
  }

  return React.cloneElement(React.Children.only(children), {
    onContextMenu: showMenu,
  })
}

export default ContextMenu
