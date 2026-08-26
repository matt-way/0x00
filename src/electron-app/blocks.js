import store from './store'
import chokidar from 'chokidar'
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
import { join, dirname, resolve } from './disk/path'
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

// node_modules would flood the watcher during a dependency install, and there is
// never anything in a dot folder we need to react to
const IGNORED_PATHS = /(?:^|[\\/])(?:node_modules|\.[^\\/]*)(?:[\\/]|$)/

const WATCH_LOG = '[code-watch]'

// The last content we know is on disk for each block code file. Both the watcher
// and the serialiser check this before acting, so neither reacts to its own write.
const diskCode = new Map()

// join() gives native separators but dirname() hands back forward slashes, so
// paths for the same file can be spelled differently depending on where they came
// from. Compare through this instead of directly.
const pathKey = _path =>
  process.platform === 'win32' ? resolve(_path).toLowerCase() : resolve(_path)

const getCodePath = block =>
  join(block.path, block.config.main || BLOCK_DEFAULT_CODE_FILE)

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
  const blockCodePath = join(blockPath, config.main || BLOCK_DEFAULT_CODE_FILE)
  const code = await readFile(blockCodePath)
  diskCode.set(pathKey(blockCodePath), code)
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
  const codePath = getCodePath(block)
  // this content is already on disk, so the change came from the watcher.
  // writing it back would only churn the file's mtime for external tools.
  if (diskCode.get(pathKey(codePath)) === block.hotcode) {
    return
  }
  diskCode.set(pathKey(codePath), block.hotcode)
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

let codeWatcher

const findBlockByCodePath = filePath => {
  const { blocks } = store.getState()
  const key = pathKey(filePath)
  const blockId = Object.keys(blocks).find(id => {
    const block = blocks[id]
    // blocks mid-create have no path or config yet
    return block.path && block.config && pathKey(getCodePath(block)) === key
  })

  if (!blockId) {
    // most likely a file we don't care about, but if it was a block's code file
    // then the paths are spelled differently and we need to see both to fix it
    console.log(`${WATCH_LOG} no block for ${key}`)
    Object.keys(blocks).forEach(id => {
      const block = blocks[id]
      if (block.path && block.config) {
        console.log(`${WATCH_LOG}   known ${pathKey(getCodePath(block))}`)
      }
    })
  }

  return blockId
}

const loadExternalCode = async filePath => {
  const blockId = findBlockByCodePath(filePath)
  if (!blockId) {
    return
  }

  const code = await readFile(filePath)
  diskCode.set(pathKey(filePath), code)

  // an external edit wins over an unsaved editor buffer, so this compares
  // against hotcode too rather than just the last saved code
  const block = store.getState().blocks[blockId]
  if (block.code === code && block.hotcode === code) {
    console.log(`${WATCH_LOG} ${block.name} already up to date, ignoring`)
    return
  }

  // persistCode is the same action an in-app save dispatches, so the editor
  // updates and the engine re-runs the block exactly as if it had been saved
  console.log(`${WATCH_LOG} applying external change to ${block.name}`)
  dispatch(actions.persistCode(blockId, code))
}

const watchCode = programPath => {
  if (codeWatcher) {
    codeWatcher.close()
    codeWatcher = null
  }
  if (!programPath) {
    return
  }

  const watchPath = join(programPath, BLOCK_FOLDER)
  console.log(`${WATCH_LOG} watching ${watchPath}`)

  codeWatcher = chokidar.watch(watchPath, {
    ignoreInitial: true,
    ignored: IGNORED_PATHS,
    // editors and agents often write in several chunks; wait for the file
    // to settle so we never read a half-written block
    awaitWriteFinish: { stabilityThreshold: 50, pollInterval: 10 },
    // native fs events don't arrive on some network and virtual drives, which
    // looks exactly like the watcher being broken. set NULL_WATCH_POLL=1 to
    // fall back to polling.
    usePolling: !!process.env.NULL_WATCH_POLL,
  })

  codeWatcher
    .on('ready', () => {
      const watched = codeWatcher.getWatched()
      const count = Object.values(watched).reduce((n, f) => n + f.length, 0)
      console.log(
        count > 0
          ? `${WATCH_LOG} ready, tracking ${count} entries`
          : `${WATCH_LOG} ready but tracking nothing - does that path exist?`
      )
    })
    // some editors write in place ('change'), others write a temp file and
    // rename it over the target, which surfaces as 'add'. handle both.
    .on('all', (event, filePath) => {
      console.log(`${WATCH_LOG} ${event} ${filePath}`)
      if (event !== 'change' && event !== 'add') {
        return
      }
      loadExternalCode(filePath).catch(err => {
        console.error(`${WATCH_LOG} failed on ${filePath}`, err)
      })
    })
    .on('error', err => console.error(`${WATCH_LOG} error`, err))
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

  // watch for code changes made outside the app. re-targets whenever a
  // different program is opened, and stops while none is
  console.log(`${WATCH_LOG} init, waiting for a program to open`)
  subscribe('program.path', watchCode)

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
