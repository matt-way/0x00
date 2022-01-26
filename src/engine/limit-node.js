import Module from 'module'
import path from 'path'
import builtinModules from 'builtin-modules'
import requireFromString from 'require-from-string'

const MODULES_FOLDER = '/node_modules/'

const oldRequire = Module.prototype.require

let store

Object.defineProperty(Module.prototype, 'require', {
  value: function require(moduleName) {
    if (builtinModules.indexOf(moduleName) >= 0) {
      console.log('Warning: Attempting to require builtin module:', moduleName)
      return oldRequire(moduleName)
    }

    console.log(`Attempting require of ${moduleName}`)
    const moduleParts = moduleName.split('/')
    const parentParts = this.filename.split('/')
    const blockId = parentParts.shift()
    if (!store || !blockId || !store.getState().blocks[blockId]) {
      throw new Error(`Illegal require of ${moduleName}`)
    }

    // if there is no parent module
    let parentModule
    if (parentParts.length <= 0) {
      if (moduleName[0] === '@') {
        parentModule = `${moduleParts[0]}/${moduleParts[1]}`
      } else {
        parentModule = moduleParts[0]
      }
    } else {
      parentModule = parentParts.shift()
      if (parentModule[0] === '@') {
        parentModule += `/${parentParts.shift()}`
      }
    }

    const { dependencies } = store.getState().blocks[blockId]
    const { contents } = dependencies[parentModule]

    // we need to figure out if the module is relative, absolute, or a root package
    let codePath
    if (moduleName[0] !== '.') {
      if (
        moduleParts.length === 1 ||
        (moduleName[0] === '@' && moduleParts.length === 2)
      ) {
        // attempting to load a base package
        // get the package json and figure out the main path to load
        const packagePath = `${MODULES_FOLDER}${moduleName}/package.json`
        const packageJson = JSON.parse(contents[packagePath].content)
        codePath = `${MODULES_FOLDER}${moduleName}/${
          packageJson.main || 'index.js'
        }`
      } else {
        // attempting to load an absolute file path
        codePath = `${MODULES_FOLDER}${moduleName}`
      }
    } else {
      // attempting to load a relative path
      const parentPath = path.dirname(parentParts.join('/'))
      codePath = `/${path.join(parentPath, moduleName)}`
      if (codePath[codePath.length - 1] === '/') {
        codePath += 'index.js'
      }
    }

    const extension = path.extname(codePath)
    if (!extension) {
      codePath += '.js'
    }

    const code = contents[codePath].content
    return requireFromString(code, `${blockId}/${parentModule}${codePath}`)
  },
})

const setRequireStore = _store => {
  store = _store
}

const oldProcess = window.process
window.process = new Proxy(oldProcess, {
  get: (target, prop) => {
    return target[prop]
  },
})

export { setRequireStore }
