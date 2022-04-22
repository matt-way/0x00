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
    reorderPropertyAbove: (blocks, blockId, propId, abovePropId) => {
      const { block } = blocks[blockId].config
      const propIndex = block.propertyOrder.findIndex(n => n === propId)
      const aboveIndex = block.propertyOrder.findIndex(n => n === abovePropId)
      const to = propIndex < aboveIndex ? aboveIndex - 1 : aboveIndex
      block.propertyOrder.splice(
        to,
        0,
        block.propertyOrder.splice(propIndex, 1)[0]
      )
    },
    reorderPropertyBelow: (blocks, blockId, propId, belowPropId) => {
      const { block } = blocks[blockId].config
      const propIndex = block.propertyOrder.findIndex(n => n === propId)
      const belowIndex = block.propertyOrder.findIndex(n => n === belowPropId)
      const to = propIndex < belowIndex ? belowIndex : belowIndex + 1
      block.propertyOrder.splice(
        to,
        0,
        block.propertyOrder.splice(propIndex, 1)[0]
      )
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
    [programConstants.createLink]: (
      blocks,
      sourceBlockId,
      sourcePropId,
      targetBlockId,
      targetPropId
    ) => {
      const { block: sourceBlock } = blocks[sourceBlockId].config
      const { block: targetBlock } = blocks[targetBlockId].config

      if (!sourceBlock.properties) {
        sourceBlock.properties = {}
      }
      if (!sourceBlock.properties[sourcePropId]) {
        sourceBlock.properties[sourcePropId] = {}
        sourceBlock.propertyOrder.push(sourcePropId)
      }

      if (!targetBlock.properties) {
        targetBlock.properties = {}
      }
      if (!targetBlock.properties[targetPropId]) {
        targetBlock.properties[targetPropId] = {}
        targetBlock.propertyOrder.push(targetPropId)
      }
    },
  })
)
