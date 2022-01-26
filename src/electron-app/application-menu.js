import store from './store'
import { Menu } from 'electron'
import { newProgram, openProgram } from './program'
import * as workspaceActions from 'state/workspace/interface'

const initApplicationMenu = () => {
  const menuTemplate = [
    {
      label: '&File',
      submenu: [
        {
          label: 'New &Program',
          accelerator: 'CmdOrCtrl+Shift+N',
          click: () => newProgram(),
        },
        {
          label: '&Open Program',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: () => openProgram(),
        },
        {
          label: '&Save Block',
          accelerator: 'CmdOrCtrl+S',
          click: () => store.dispatch(workspaceActions.saveBlock()),
        },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        {
          role: 'cut',
        },
        {
          role: 'copy',
        },
        {
          role: 'paste',
        },
      ],
    },
    {
      label: '&View',
      submenu: [
        {
          label: 'Toggle Sidebar',
          accelerator: 'CmdOrCtrl+B',
          click: () => store.dispatch(workspaceActions.toggleSidebar()),
        },
        {
          label: 'Toggle Program Docked',
          accelerator: 'CmdOrCtrl+P',
          click: () =>
            store.dispatch(workspaceActions.toggleEnginePanelAttached()),
        },
        {
          role: 'zoomIn',
        },
        {
          role: 'zoomOut',
        },
        {
          role: 'resetZoom',
        },
      ],
    },
    /*{
      label: '&Program',
      submenu: [
        {
          label: 'New Program',
          click: () => newProgram()
        }
      ]
    },*/
    {
      label: 'Developer',
      submenu: [
        {
          label: 'Toggle Devtools',
          role: 'toggledevtools',
        },
      ],
    },
    /*{
      label: 'Help',
      submenu: [{ role: 'about' }]
    }*/
  ]

  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)
}

export { initApplicationMenu }
