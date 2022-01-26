import store from './store'
import { app, dialog } from 'electron'
import { readJson, writeJson } from './disk/fs'
import { join, dirname } from './disk/path'
import { openBlock } from './blocks'
import { normalise, denormalise } from './normalisation/program'
import { subscribe } from 'state-management/watcher'
import { cloneTemplate, Templates } from './templates'
import ipcConstants from 'ipc/constants'
import { handle } from 'ipc/main'
import { actions } from 'state/program/model'

const PROGRAM_CONFIG_FILE = 'program.json'

const newProgram = async () => {
  const res = await dialog.showOpenDialog({
    title: 'Select New Program Folder',
    properties: ['openDirectory', 'createDirectory', 'promptToCreate'],
    buttonLabel: 'Create Program Here',
    defaultPath: app.getPath('documents'),
  })
  if (res && res.filePaths.length > 0) {
    const folder = res.filePaths[0]
    await cloneTemplate(Templates.PROGRAM, folder)
    return openProgram(join(res.filePaths[0], PROGRAM_CONFIG_FILE))
  }
}

const openProgram = async path => {
  let programPath = path
  if (!path) {
    const res = await dialog.showOpenDialog({
      title: 'Open Program',
      properties: ['openFile'],
      buttonLabel: 'Open Program',
      defaultPath: app.getPath('documents'),
      filters: [
        { name: 'Program JSON', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    })
    if (res && res.filePaths.length > 0) {
      const paths = res.filePaths
      programPath = paths[0]
    }
  }
  if (programPath) {
    store.dispatch(actions.reset())
    const config = await readJson(programPath)
    const programDir = dirname(programPath)

    // load all the blocks
    await Promise.all(
      Object.keys(config.blocks).map(blockName => {
        return openBlock(programDir, blockName)
      })
    )

    const { blocks } = store.getState()
    const normConfig = normalise(config, blocks)

    return store.dispatch(actions.load(programDir, programPath, normConfig))
  }
}

const serialiseProgram = () => {
  const { program, blocks } = store.getState()
  const config = denormalise(program.config, blocks)
  if (Object.keys(config).length <= 0) {
    throw new Error('Trying to write empty config')
  }
  return writeJson(program.configPath, config)
}

const initProgram = () => {
  subscribe('program', (program, oldProgram) => {
    if (
      program?.config !== oldProgram?.config &&
      program?.configPath === oldProgram?.configPath
    ) {
      return serialiseProgram()
    }
  })

  const programChannels = ipcConstants.program
  handle(programChannels.create, newProgram)
  handle(programChannels.open, openProgram)
}

export { initProgram, newProgram, openProgram, serialiseProgram }
