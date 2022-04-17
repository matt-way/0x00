import store from './store'
import { Menu } from 'electron'
import { newProgram, openProgram } from './program'
import * as workspaceActions from 'state/workspace/interface'

const initApplicationMenu = recentPrograms => {
  let recentSubmenu = [
    {
      label: 'No recent programs',
      enabled: false,
    },
  ]

  if (recentPrograms) {
    recentSubmenu = recentPrograms.slice(0, 10).map(programPath => {
      const parts = programPath.split(/[/\\]+/)

      return {
        label: `${parts[parts.length - 2]} (${parts.slice(0, -2).join('/')})`,
        click: () => openProgram(programPath),
      }
    })
  }

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
          label: '&Recent Programs',
          submenu: recentSubmenu,
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
