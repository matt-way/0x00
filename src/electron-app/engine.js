import { BrowserWindow, BrowserView } from 'electron'
import { join } from './disk/path'
import { handle } from 'ipc/main'
import ipcConstants from 'ipc/constants'

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

  handle(ipcConstants.engine.setBounds, rect => {
    engineView.setBounds(rect)
  })
}

export function detachEngine(mainWindow) {
  mainWindow.removeBrowserView(engineView)

  engineWindow = new BrowserWindow({
    width: 1000,
    height: 1000,
    backgroundColor: '#fff',
    autoHideMenuBar: true,
    title: '0x00 Engine',
    webPreferences: {},
    icon: join(__dirname, '../../assets/logo/64x64.png'),
  })

  engineWindow.setBrowserView(engineView)
  engineView.setBounds({ x: 0, y: 0, width: 1000, height: 1000 })
  engineView.setAutoResize({ width: true, height: true })

  engineWindow.loadFile('../engine/index.html')
}

export async function attachEngine(mainWindow) {
  mainWindow.setBrowserView(engineView)
  engineWindow.close()
  //engineView.webContents.setBackgroundThrottling(true)
}

export function reloadEngine() {
  engineView.webContents.reload()
}
