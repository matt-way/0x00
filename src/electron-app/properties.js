import ipcConstants from 'ipc/constants'
import { dialog } from 'electron'
import { handle } from 'ipc/main'
import path from 'path'

const selectFile = async blockPath => {
  const res = await dialog.showOpenDialog({
    title: 'Select File',
    buttonLabel: 'Select File',
    properties: ['openFile'],
  })
  if (res && res.filePaths.length > 0) {
    const staticPath = res.filePaths[0]
    const programPath = path.join(blockPath, '../../')

    // if the selected path is within the program path, then we return
    // a relative path from the block folder. This allows copying blocks,
    // and moving projects around without breaking paths. However if the path
    // is outside the project, then we want it to remain static so project moving
    // doesn't break paths.
    const relative = path.relative(programPath, staticPath)
    if (relative.startsWith('..')) {
      return staticPath
    }
    return path.relative(blockPath, staticPath)
  }
}

const initProperties = () => {
  const propertiesChannels = ipcConstants.properties
  handle(propertiesChannels.selectFile, selectFile)
}

export { initProperties }
