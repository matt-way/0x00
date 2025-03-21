import { BrowserView, BrowserWindow, app, protocol } from 'electron'
import {
  attachEngine,
  detachEngine,
  initialiseEngineWindow,
  reloadEngine,
} from './engine'
import installExtension, { REDUX_DEVTOOLS } from 'electron-devtools-installer'
import { join, normalize } from './disk/path'

import { initApplicationMenu } from './application-menu'
import { initBlocks } from './blocks'
import { initContextMenu } from 'electron-react-context-menu/main'
import { initProgram } from './program'
import { initProperties } from './properties'
import { initSettings } from './settings'
import { subscribe } from 'state-management/watcher'

let mainWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    webPreferences: {
      //nativeWindowOpen: true,
      preload: join(__dirname, 'preload-esm.js'),
      sandbox: false,
    },
    width: 1200,
    height: 900,
    backgroundColor: '#0f1618',
    icon: join(__dirname, '../../assets/logo/64x64.png'),
    show: false,
  })

  // and load the index.html of the app.
  mainWindow.loadURL('http://localhost:8080')

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()
  mainWindow.once('ready-to-show', () => {
    // this is necessary to fix cached zoom factor issues
    mainWindow.webContents.setZoomFactor(1)
    mainWindow.maximize()
    mainWindow.show()
    initialiseEngineWindow(mainWindow)
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  app.setName('0x00')

  installExtension(REDUX_DEVTOOLS)
    .then(name => {
      console.log(`Added Extension:  ${name}`)
    })
    .catch(err =>
      console.log('An error occurred installing the extension: ', err)
    )

  protocol.registerFileProtocol('asset', (req, cb) => {
    const url = req.url.substr(8)
    cb({ path: normalize(`${__dirname}/../../assets${url}`) })
  })

  protocol.registerFileProtocol('file', (req, cb) => {
    const url = req.url.substr(5)
    cb({ path: normalize(url) })
  })

  // start all watchers and listeners
  initContextMenu()
  initSettings()
  initBlocks()
  initProgram()
  initProperties()

  // load the primary menu
  initApplicationMenu()

  createWindow()

  subscribe('settings.system.recentPrograms', programs => {
    initApplicationMenu(programs)
  })

  subscribe('workspace.enginePanelAttached', (attached, prevAttached) => {
    if (prevAttached != null && attached !== prevAttached) {
      if (attached) {
        attachEngine(mainWindow)
      } else {
        detachEngine(mainWindow)
      }
    }
  })

  subscribe('program.path', programPath => {
    mainWindow.setTitle(`${app.getName()} - ${programPath}`)
  })

  subscribe('program.reloadEngine', () => {
    console.log('reloading engine!')
    reloadEngine()
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  // TODO: decide if we want traditional macos behaviour
  //if (process.platform !== 'darwin') app.quit()
  app.quit()
})
