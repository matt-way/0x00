const r = require('esm-wallaby')(module, {
  mode: 'all',
  cjs: true,
  cache: false,
})

// hack to get preload esm to include root src path
const path = require('path')
const rootPath = path.resolve(__dirname, '..')
const BuiltInModule = r('module')
const oldResolve = BuiltInModule._resolveFilename
BuiltInModule._resolveFilename = function (request, parent, isMain) {
  if (parent.paths.indexOf(rootPath) < 0) {
    parent.paths.unshift(rootPath)
  }
  return oldResolve(request, parent, isMain)
}

r('./preload.js')
