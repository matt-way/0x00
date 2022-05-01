import store from './store'
import ipcConstants from 'ipc/constants'
import { DateTime } from 'luxon'
import { getAllowedName } from 'state/blocks/utils'
import { generateId } from 'utils/ids'
import { cloneTemplate, Templates } from './templates'
import {
  copy,
  deleteDirectory,
  readFile,
  readJson,
  writeFile,
  writeJson,
  renameDirectory,
  ensureDir,
} from './disk/fs'
import { join, dirname } from './disk/path'
import { subscribe } from 'state-management/watcher'
import { handle } from 'ipc/main'
import { batch } from 'react-redux'
import { serialiseProgram } from './program'
import { getDependencyId } from 'state/blocks/utils'
import { installDependency as installLocalDependency } from './dependencies'
import { actions } from 'state/blocks/model'
import * as status from 'state/statuses/interface'
import * as statusBarActions from 'state/status-bar/interface'
import * as toastActions from 'state/toasts/interface'
import { dialog } from 'electron'
import { downloadBlock as downloadBlockFromServer } from 'block-server/download'

const { dispatch } = store

const BLOCK_FOLDER = 'blocks'
const BLOCK_CONFIG_FILE = 'package.json'
const BLOCK_DEFAULT_CODE_FILE = 'code.js'
const BLOCK_DEFAULT_STATE_PATH = 'state'

const createBlock = async (x = 0, y = 0, moduleName) => {
  const { program, blocks } = store.getState()
  const name = getAllowedName(moduleName, blocks)
  const id = generateId('block')
  const newBlockPath = join(program.path, BLOCK_FOLDER, name)
  dispatch(actions.create(id, name, x, y))
  try {
    if (moduleName) {
      const npmResult = await npmInstall(moduleName, program.path)
      const installedPath = npmResult[npmResult.length - 1][1]
      await copy(installedPath, newBlockPath, {
        // TODO: figure out how to properly filter node_modules sub folders
        /*filter: function (path) {
          return path.indexOf('node_modules') > -1
        },*/
      })
    } else {
      await cloneTemplate(Templates.BLOCK, newBlockPath)
    }
    return openBlock(program.path, name, id)
  } catch (err) {
    console.log(err)
    dispatch(actions.remove(id))
    throw err
  }
}

const createBlockFromExisting = async (
  existingBlockConfigPath,
  x = 0,
  y = 0
) => {
  const { blocks, program } = store.getState()

  let existingPath = existingBlockConfigPath
  if (!existingBlockConfigPath) {
    const res = await dialog.showOpenDialog({
      title: 'Select Block Config',
      properties: ['openFile'],
      buttonLabel: 'Copy Block',
      defaultPath: program.path,
      filters: [
        { name: 'Block Package JSON', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    })
    if (res && res.filePaths.length > 0) {
      const paths = res.filePaths
      existingPath = paths[0]
    }
  }

  const blockFolder = dirname(existingPath)
  const blockName = blockFolder.split('/').pop()
  const newBlockName = getAllowedName(blockName, blocks)
  const id = generateId('block')
  dispatch(actions.create(id, newBlockName, x, y))
  try {
    await copy(blockFolder, join(program.path, BLOCK_FOLDER, newBlockName))
    return openBlock(program.path, newBlockName, id)
  } catch (err) {
    console.log(err)
    dispatch(actions.remove(id))
    throw err
  }
}

const downloadBlock = async (name, version, x = 0, y = 0) => {
  const { blocks, program } = store.getState()

  // create a temp block while performing async loading
  const id = generateId('block')
  const blockName = getAllowedName(name, blocks)
  dispatch(actions.create(id, blockName, x, y))

  try {
    const blockJSON = await downloadBlockFromServer(name, version)

    const packageJSON = blockJSON['package.json']
    const { main = 'code.js' } = packageJSON
    const code = blockJSON[main]

    // write the base block files to disk inside the project folder
    // ensure that the config is set to locked initially for any downloaded block
    const blockPath = join(program.path, BLOCK_FOLDER, blockName)
    await ensureDir(blockPath)
    await writeFile(
      join(blockPath, 'package.json'),
      JSON.stringify({
        ...packageJSON,
        locked: true,
      })
    )
    await writeFile(join(blockPath, main), code)
    return openBlock(program.path, blockName, id)
  } catch (err) {
    console.log(err)
    dispatch(actions.remove(id))
    throw err
  }
}

const openBlock = async (
  programPath,
  blockName,
  blockStateId = generateId('block')
) => {
  const blockPath = join(programPath, BLOCK_FOLDER, blockName)
  const config = await readJson(join(blockPath, BLOCK_CONFIG_FILE))
  const code = await readFile(
    join(blockPath, config.main || BLOCK_DEFAULT_CODE_FILE)
  )
  const depNames = Object.keys(config.dependencies || {})
  const manifests = await Promise.all(
    depNames.map(dependencyName => {
      const version = config.dependencies[dependencyName]
      return installLocalDependency(dependencyName, version, blockPath)
    })
  )
  const dependencies = {}
  manifests.forEach((manifest, i) => {
    dependencies[depNames[i]] = manifest
  })
  dispatch(
    actions.load(blockStateId, blockName, blockPath, config, code, dependencies)
  )
  return blockStateId
}

const removeBlock = async blockId => {
  const { blocks } = store.getState()
  await deleteDirectory(blocks[blockId].path)
  dispatch(actions.remove(blockId))
}

const serialiseConfig = blockId => {
  const { blocks } = store.getState()
  const block = blocks[blockId]
  return writeJson(join(block.path, BLOCK_CONFIG_FILE), block.config)
}

const serialiseCode = blockId => {
  const { blocks } = store.getState()
  const block = blocks[blockId]
  const codePath = join(
    block.path,
    block.config.main || BLOCK_DEFAULT_CODE_FILE
  )
  return writeFile(codePath, block.hotcode)
}

const updateInfo = async (blockId, info) => {
  const { blocks } = store.getState()
  const { name, path } = blocks[blockId]
  if (name !== info.name) {
    const newPath = join(dirname(path), info.name)
    await renameDirectory(path, newPath)
    dispatch(actions.rename(blockId, info.name, newPath))
  }
  dispatch(actions.updateInfo(blockId, info))
}

const installDependency = async (blockId, packageObj) => {
  const { name, version } = packageObj
  const id = getDependencyId(blockId, name)

  try {
    batch(() => {
      dispatch(
        status.pending(
          id,
          actions.installDependencyStart(blockId, name, version)
        )
      )
      dispatch(statusBarActions.setInfo(id, `Installing ${name}`))
    })

    const dependency = await installLocalDependency(name, version)

    dispatch(
      status.complete(
        id,
        actions.installDependencyComplete(blockId, name, dependency)
      )
    )
  } catch (error) {
    console.log(error)
    batch(() => {
      dispatch(
        toastActions.addError(
          id,
          `Error installing ${name}`,
          `Dependency could not be installed: ${error}`
        )
      )
      dispatch(
        status.error(id, error, actions.installDependencyError(blockId, name))
      )
    })
  } finally {
    dispatch(statusBarActions.removeItem(id))
  }
}

const uninstallDependency = async (blockId, packageName) => {
  dispatch(actions.uninstallDependency(blockId, packageName))
}

const saveState = async (blockId, name, property) => {
  const blockPath = store.getState().blocks[blockId].path
  const defaultPath = join(blockPath, BLOCK_DEFAULT_STATE_PATH)
  const now = DateTime.local()
  const defaultFilename = `${now.toFormat('yyyy-mm-dd_HHmm_ss')}.state`

  const res = await dialog.showSaveDialog({
    title: 'Save Block State',
    properties: ['openFile'],
    buttonLabel: 'Save Block State',
    defaultPath: join(defaultPath, defaultFilename),
    filters: [
      { name: 'Block State', extensions: ['state'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  })
  if (res && res.filePath) {
    dispatch(actions.saveBlockState(blockId, res.filePath))
  }
}

const loadState = async blockId => {
  const blockPath = store.getState().blocks[blockId].path
  const defaultPath = join(blockPath, BLOCK_DEFAULT_STATE_PATH)

  const res = await dialog.showOpenDialog({
    title: 'Load Block State',
    properties: ['openFile'],
    buttonLabel: 'Load Block State',
    defaultPath: defaultPath,
    filters: [
      { name: 'Block State', extensions: ['state'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  })

  if (res && res.filePaths.length > 0) {
    dispatch(actions.loadBlockState(blockId, res.filePaths[0]))
  }
}

const initBlocks = () => {
  // watch for config changes
  subscribe('blocks', (blocks, oldBlocks) => {
    Object.keys(blocks).forEach(blockId => {
      const block = blocks[blockId]
      const oldBlock = oldBlocks[blockId]
      if (oldBlock) {
        if (block.config !== oldBlock.config) {
          serialiseConfig(blockId)
        }
        if (block.name !== oldBlock.name) {
          serialiseProgram()
        }
        if (block.code !== oldBlock.code) {
          serialiseCode(blockId)
        }
      }
    })
  })

  // watch for code changes

  const blockChannels = ipcConstants.blocks
  handle(blockChannels.create, createBlock)
  handle(blockChannels.createFromExisting, createBlockFromExisting)
  handle(blockChannels.download, downloadBlock)
  handle(blockChannels.remove, removeBlock)
  handle(blockChannels.updateInfo, updateInfo)
  handle(blockChannels.installDependency, installDependency)
  handle(blockChannels.uninstallDependency, uninstallDependency)
  handle(blockChannels.saveState, saveState)
  handle(blockChannels.loadState, loadState)
}

export { initBlocks, createBlock, createBlockFromExisting, openBlock }
