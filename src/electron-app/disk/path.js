import path from 'path'

export const join = path.join
export const basename = path.basename
export const extname = path.extname
export const resolve = path.resolve
export const normalize = path.normalize
export const sep = path.sep

export const dirname = _path => {
  var slashFixed = _path.split('\\').join('/')
  return path.dirname(slashFixed)
}
