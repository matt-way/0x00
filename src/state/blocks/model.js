import { buildModel } from 'state-management/builder'
import { constants as programConstants } from '../program/model'

const initialState = () => ({})

export const { actions, reducer, constants } = buildModel(
  'blocks',
  initialState(),
  {
    create: (blocks, id, name) => {
      blocks[id] = {
        id,
        name,
        loading: true,
      }
    },
    load: (blocks, id, name, path, config, code, dependencies) => {
      blocks[id] = {
        id,
        name: name,
        path,
        config,
        code,
        hotcode: code,
        dependencies,
      }
    },
    unlock: (blocks, id) => {
      delete blocks[id].config.locked
    },
    remove: (blocks, blockId) => {
      delete blocks[blockId]
    },
    rename: (blocks, blockId, newName, newPath) => {
      blocks[blockId].name = newName
      blocks[blockId].path = newPath
    },
    updateInfo: (blocks, blockId, info) => {
      blocks[blockId].config = {
        ...blocks[blockId].config,
        ...info,
      }
    },
    updateCode: (blocks, blockId, code) => {
      blocks[blockId].hotcode = code
      blocks[blockId].codeChanged = true
    },
    persistCode: (blocks, blockId, formattedCode) => {
      blocks[blockId].code = blocks[blockId].hotcode = formattedCode
      blocks[blockId].codeChanged = false
    },
    createProperty: (blocks, blockId, name, property) => {
      const { block } = blocks[blockId].config
      if (!block.properties) {
        block.properties = {}
      }
      block.properties[name] = property
      block.propertyOrder.push(name)
    },
    updateProperty: (blocks, blockId, name, oldName, property) => {
      const { block } = blocks[blockId].config
      if (name !== oldName) {
        delete block.properties[oldName]
        const orderIndex = block.propertyOrder.findIndex(n => n === oldName)
        block.propertyOrder[orderIndex] = name
      }
      block.properties[name] = property
    },
    removeProperty: (blocks, blockId, name) => {
      const { block } = blocks[blockId].config
      delete block.properties[name]
      block.propertyOrder = block.propertyOrder.filter(n => n !== name)
    },
    installDependencyStart: (blocks, blockId, packageName, version) => {
      const { config } = blocks[blockId]
      config.dependencies = {
        ...config.dependencies,
        [packageName]: version,
      }
    },
    installDependencyComplete: (blocks, blockId, packageName, manifest) => {
      const block = blocks[blockId]
      if (!block.dependencies) {
        block.dependencies = {}
      }
      console.log('completed', packageName, manifest)
      block.dependencies[packageName] = manifest
    },
    installDependencyError: (blocks, blockId, packageName, error) => {
      delete blocks[blockId].config.dependencies[packageName]
    },
    uninstallDependency: (blocks, blockId, packageName) => {
      const block = blocks[blockId]
      delete block.config.dependencies[packageName]
      delete block.dependencies[packageName]
    },
    saveBlockState: (blocks, blockId, path) => {
      blocks[blockId].saveBlockState = { path, hash: Math.random() }
    },
    loadBlockState: (blocks, blockId, path) => {
      blocks[blockId].loadBlockState = { path, hash: Math.random() }
    },
  },
  () => ({
    [programConstants.reset]: () => initialState(),
  })
)
