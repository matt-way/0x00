import fs from 'fs-extra'
import * as path from './path'
import { shell } from 'electron'
import { generateId } from 'utils/ids'

export const getFileDetails = filePath => {
  return fs.stat(filePath).then(stat => {
    const result = {
      name: path.basename(filePath),
      path: filePath,
    }

    if (stat && stat.isDirectory()) {
      result.children = []
      result.loaded = false
    } else {
      result.ext = path.extname(filePath)
    }

    return result
  })
}

export const readDirectory = async (
  dir,
  parentId,
  idGenerator = generateId
) => {
  const exists = await fs.exists(dir)
  if (!exists) {
    await fs.mkdir(dir)
  }

  const files = await fs.readdir(dir)

  const details = await Promise.all(
    files.map(file => {
      const filePath = path.resolve(dir, file)
      return getFileDetails(filePath)
    })
  )

  return details.reduce((obj, file) => {
    const id = idGenerator()
    obj[id] = {
      ...file,
    }
    if (parentId) {
      obj[id].parentId = parentId
    }
    return obj
  }, {})
}

export const createDirectory = _path => {
  return fs.mkdir(_path).then(() => getFileDetails(_path))
}

export const deleteDirectory = _path => {
  return shell.trashItem(_path)
}

export const readFile = (_path, options = 'utf8') => fs.readFile(_path, options)

export const writeFile = (_path, data, options) =>
  fs.writeFile(_path, data, options)

export const copy = fs.copy
export const readJson = fs.readJson
export const readJsonSync = fs.readJsonSync

export const writeJson = (
  _path,
  object,
  options = {
    spaces: 2,
  }
) => fs.writeJson(_path, object, options)

export const renameDirectory = fs.rename
export const ensureDir = fs.ensureDir
export const existsSync = fs.existsSync
export const readFileSync = fs.readFileSync
export const writeFileSync = fs.writeFileSync
export const mkdirSync = fs.mkdirSync
