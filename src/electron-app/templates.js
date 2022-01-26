import { app } from 'electron'
import { join } from './disk/path'
import { copy } from './disk/fs'

const tpl_prefix = app.isPackaged ? '../' : '../../'

const Templates = {
  PROGRAM: `${tpl_prefix}templates/program`,
  BLOCK: `${tpl_prefix}templates/block`,
}

const cloneTemplate = (type, dir) => {
  return copy(join(app.getAppPath(), type), dir)
}

export { Templates, cloneTemplate }
