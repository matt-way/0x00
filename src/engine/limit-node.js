import Module from 'module'
import builtinModules from 'builtin-modules'
import path from 'path'
import { requireCode } from './require-system'

const MODULES_FOLDER = '/node_modules/'

const oldRequire = Module.prototype.require

let store
let moduleStack = []

const joinSep = (...args) => {
  return path.join(...args).replace(/\\/g, '/')
}

/*
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

    const { dependencies } = store.getState().blocks[blockId]

    // the module being loaded might be a child module of the parent
    // but it could also be an already loaded sibling primary module
    // always check for primary before attempting to load as child
    let parentModule
    if (moduleName[0] === '@') {
      parentModule = `${moduleParts[0]}/${moduleParts[1]}`
    } else {
      parentModule = moduleParts[0]
    }

    if (!dependencies[parentModule]) {
      parentModule = parentParts.shift()
      if (parentModule[0] === '@') {
        parentModule += `/${parentParts.shift()}`
      }
    }

    if (!dependencies[parentModule]) {
      throw new Error('Module not found: ' + moduleName)
    }

    const { contents, dependencyAliases } = dependencies[parentModule]

    // we need to figure out if the module is relative, absolute, or a root package
    let codePaths = []
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

        if (packageJson.browser) {
          if (typeof packageJson.browser === 'string') {
            codePaths.push(
              joinSep(MODULES_FOLDER, moduleName, packageJson.browser)
            )
          } else if (packageJson.browser[packageJson.module]) {
            codePaths.push(
              joinSep(
                MODULES_FOLDER,
                moduleName,
                packageJson.browser[packageJson.module]
              )
            )
          }
        }
        if (packageJson.module) {
          codePaths.push(
            joinSep(MODULES_FOLDER, moduleName, packageJson.module)
          )
        }
        if (packageJson.main) {
          codePaths.push(joinSep(MODULES_FOLDER, moduleName, packageJson.main))
        }
        codePaths.push(joinSep(MODULES_FOLDER, moduleName, 'index.js'))

        // handle newer exports key
        if (packageJson.exports) {
          const subpath =
            moduleParts.length > 1 ? './' + moduleParts.slice(1).join('/') : '.'
          const target = packageJson.exports[subpath]
          if (target) {
            if (typeof target === 'string') {
              codePaths.push(joinSep(MODULES_FOLDER, parentModule, target))
            } else {
              const value = target.import || target.default
              if (value) {
                codePaths.push(joinSep(MODULES_FOLDER, parentModule, value))
              }
            }
          }
        }

        moduleStack.push(moduleName)
        primaryModule = true
      } else {
        // attempting to load an absolute file path
        codePaths.push(joinSep(MODULES_FOLDER, moduleName))
      }
    } else {
      // attempting to load a relative path
      const parentPath = path.dirname(parentParts.join('/'))
      codePaths.push(`/${joinSep(parentPath, moduleName)}`)
    }

    let validPath
    for (const cp of codePaths) {
      const potentialPaths = [cp]
      if (cp[cp.length - 1] === '/') {
        potentialPaths.push(cp + 'index.js')
      } else if (!path.extname(cp)) {
        potentialPaths.push(cp + '.js')
        potentialPaths.push(cp + '/index.js')
      } else if (path.extname(cp) !== '.js') {
        potentialPaths.push(cp + '.js')
      }
      validPath = potentialPaths.find(p => contents[p])
      if (validPath) {
        break
      }
    }

    if (!validPath) {
      throw new Error(
        `Unable to find matching module for paths ${codePaths}, for parent module ${parentModule}`
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

*/

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
