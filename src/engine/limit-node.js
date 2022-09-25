import Module from 'module'
import path from 'path'
import builtinModules from 'builtin-modules'
import { requireCode } from './require-system'

const MODULES_FOLDER = '/node_modules/'

const oldRequire = Module.prototype.require

let store
let moduleStack = []

const joinSep = (...args) => {
  return path.join(...args).replace(/\\/g, '/')
}

Object.defineProperty(Module.prototype, 'require', {
  value: function require(moduleName) {
    let primaryModule = false
    const primaryName = moduleName.split(':')[1] || moduleName
    if (
      builtinModules.indexOf(primaryName) >= 0 ||
      primaryName === 'electron'
    ) {
      console.log('Warning: Attempting to require builtin module:', moduleName)
      return oldRequire(moduleName)
    }

    //console.log(`Attempting require of ${moduleName}`)
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

    if (!dependencies[parentModule]) {
      throw new Error('Module not found: ' + moduleName)
    }

    const { contents, dependencyAliases } = dependencies[parentModule]

    // we need to figure out if the module is relative, absolute, or a root package
    let codePath
    if (moduleName[0] !== '.') {
      if (
        moduleParts.length === 1 ||
        (moduleName[0] === '@' && moduleParts.length === 2)
      ) {
        // figure out if the required module has an aliased name to use
        if (dependencyAliases && moduleStack.length > 0) {
          const parentName = moduleStack[moduleStack.length - 1]
          if (
            dependencyAliases[parentName] &&
            dependencyAliases[parentName][moduleName]
          ) {
            moduleName = dependencyAliases[parentName][moduleName]
          }
        }

        // attempting to load a base package
        // get the package json and figure out the main path to load
        const packagePath = `${MODULES_FOLDER}${moduleName}/package.json`
        const packageJson = JSON.parse(contents[packagePath].content)
        codePath = joinSep(
          MODULES_FOLDER,
          moduleName,
          (typeof packageJson.browser === 'string' && packageJson.browser) ||
            packageJson.module ||
            packageJson.main ||
            'index.js'
        )

        moduleStack.push(moduleName)
        primaryModule = true
      } else {
        // attempting to load an absolute file path
        codePath = joinSep(MODULES_FOLDER, moduleName)
      }
    } else {
      // attempting to load a relative path
      const parentPath = path.dirname(parentParts.join('/'))
      codePath = `/${joinSep(parentPath, moduleName)}`
    }

    const potentialPaths = [codePath]
    if (codePath[codePath.length - 1] === '/') {
      potentialPaths.push(codePath + 'index.js')
    } else if (!path.extname(codePath)) {
      potentialPaths.push(codePath + '.js')
      potentialPaths.push(codePath + '/index.js')
    } else if (path.extname(codePath) !== '.js') {
      potentialPaths.push(codePath + '.js')
    }

    const validPath = potentialPaths.find(p => contents[p])
    if (!validPath) {
      throw new Error(
        `Unable to find module path ${codePath}, for parent module ${parentModule}`
      )
    }

    const code = contents[validPath].content
    const result = requireCode(
      blockId,
      `${blockId}/${parentModule}${validPath}`,
      code
    )

    if (primaryModule) {
      moduleStack.pop()
    }

    return result
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
