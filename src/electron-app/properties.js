import ipcConstants from 'ipc/constants'
import { dialog } from 'electron'
import { handle } from 'ipc/main'

const selectFile = async () => {
  const res = await dialog.showOpenDialog({
    title: 'Select File',
    buttonLabel: 'Select File',
    properties: ['openFile'],
  })
  if (res && res.filePaths.length > 0) {
    return res.filePaths[0]
  }
}

const initProperties = () => {
  const propertiesChannels = ipcConstants.properties
  handle(propertiesChannels.selectFile, selectFile)
}

export { initProperties }
