import Module from 'module'
import path from 'path'

const moduleCache = {}

const createModule = (filename, parentModule) => {
  var paths = Module._nodeModulePaths(path.dirname(filename))
  var m = new Module(filename, parentModule)
  m.filename = filename
  m.paths = paths
  return m
}

const compileModule = (module, code, filename) => {
  module._compile(code, filename)
  return module
}

const requireCode = (contextId, filePath, code) => {
  if (!moduleCache[contextId]) {
    moduleCache[contextId] = {}
  }

  if (!moduleCache[contextId][filePath]) {
    // create a temporary exports object so that circular deps can be resolved
    let theModule = (moduleCache[contextId][filePath] = createModule(filePath))

    if (path.extname(filePath) === '.json') {
      theModule.exports = JSON.parse(code)
    } else {
      compileModule(theModule, code, filePath)
    }
  }

  return moduleCache[contextId][filePath].exports
}

export { requireCode }
