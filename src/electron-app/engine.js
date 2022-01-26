import { BrowserWindow, BrowserView } from 'electron'
import { join } from './disk/path'
import { handle } from 'ipc/main'
import ipcConstants from 'ipc/constants'
//import store from './store'

var engineWindow, engineView
var attached = true

export function initialiseEngineWindow(mainWindow) {
  engineView = new BrowserView({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false,
      webSecurity: false,
      preload: join(__dirname, 'preload-engine-esm.js'),
    },
    icon: join(__dirname, 'icons/64x64.png'),
  })

  mainWindow.setBrowserView(engineView)
  engineView.setAutoResize({ width: false, height: false })
  //engineView.webContents.loadURL(path.join(__dirname, 'engine/index.html'))
  engineView.webContents.loadURL('http://localhost:5000')
  engineView.webContents.openDevTools()

  // the below fixes a bug related to crashing when using browserviews
  mainWindow.on('close', () => {
    // clearing browserview
    engineView.webContents.destroy()
    if (attached) {
      mainWindow.removeBrowserView(engineView)
    }
  })

  handle(ipcConstants.engine.setBounds, rect => engineView.setBounds(rect))
}

export function detachEngine(mainWindow) {
  mainWindow.removeBrowserView(engineView)

  engineWindow = new BrowserWindow({
    width: 1000,
    height: 1000,
    backgroundColor: '#fff',
    autoHideMenuBar: true,
    title: 'Engine',
    webPreferences: {},
    icon: join(__dirname, '../../assets/logo/64x64.png'),
  })

  // this must be ran in order for events to be triggered for browserwindow
  engineWindow.loadFile('../engine/index.html')

  engineWindow.once('ready-to-show', () => {
    engineWindow.setBrowserView(engineView)
    engineView.setBounds({ x: 0, y: 0, width: 1000, height: 1000 })
    engineView.setAutoResize({ width: true, height: true })
  })
}

export function attachEngine(mainWindow) {
  mainWindow.setBrowserView(engineView)
  engineWindow.close()
}

export function reloadEngine() {
  engineView.webContents.reload()
}
