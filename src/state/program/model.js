import { set, update } from 'lodash'

import { constants as blockConstants } from '../blocks/model'
import { buildModel } from 'state-management/builder'

const initialState = () => ({
  engineRunning: true,
  loadingBlocks: {},
  activeLinks: {},
  blockErrors: {},
})

export const { actions, reducer, constants } = buildModel(
  'program',
  initialState(),
  {
    reset: () => initialState(),
    load: (program, path, configPath, config) => {
      program.path = path
      program.configPath = configPath
      program.config = Object.assign(
        {
          blocks: {},
          renderOrder: [],
        },
        config
      )
      program.loadingBlocks = {}
    },
    updateBlockPosition: (program, blockId, x, y) => {
      const block = program.config.blocks[blockId]
      if (block) {
        block.x = x
        block.y = y
      }
    },
    updateBlockOrder: (program, blockId, newIndex) => {
      const { renderOrder } = program.config
      const oldIndex = renderOrder.indexOf(blockId)
      renderOrder.splice(newIndex, 0, renderOrder.splice(oldIndex, 1)[0])
    },
    updatePropertyValue: (program, blockId, propertyId, value) => {
      const block = program.config.blocks[blockId]
      if (!block.inputValues) {
        block.inputValues = {}
      }
      block.inputValues[propertyId] = value
    },
    updateAutoloadStatePath: (program, blockId, path) => {
      const block = program.config.blocks[blockId]
      if (path && path.length > 0) {
        block.autoloadStatePath = path
      } else {
        delete block.autoloadStatePath
      }
    },
    createLink: (
      program,
      sourceBlockId,
      sourcePropId,
      targetBlockId,
      targetPropId
    ) => {
      const { config } = program
      // the target should only ever have one incoming link
      // so remove any others that might exist
      Object.keys(config.blocks).forEach(bId => {
        const block = config.blocks[bId]
        Object.keys(block.outputLinks || {}).forEach(linkSourceId => {
          const links = block.outputLinks[linkSourceId]
          const linkIndex = links.findIndex(
            l => l[targetBlockId] === targetPropId
          )
          if (linkIndex >= 0) {
            links.splice(linkIndex, 1)
          }
        })
      })

      const block = config.blocks[sourceBlockId]
      if (!block.outputLinks) {
        block.outputLinks = {}
      }
      block.outputLinks[sourcePropId] = [
        ...(block.outputLinks[sourcePropId] || []),
        {
          [targetBlockId]: targetPropId,
        },
      ]
    },
    removeLink: (
      program,
      sourceBlockId,
      sourcePropId,
      targetBlockId,
      targetPropId
    ) => {
      const { outputLinks } = program.config.blocks[sourceBlockId]
      const linkIndex = outputLinks[sourcePropId].findIndex(
        l => l[targetBlockId] === targetPropId
      )
      if (linkIndex >= 0) {
        outputLinks[sourcePropId].splice(linkIndex, 1)
      }
      set(program, `activeLinks[${sourceBlockId}][${sourcePropId}]`, false)
    },
    activateLink: (program, sourceBlockId, sourcePropId) => {
      set(program, `activeLinks[${sourceBlockId}][${sourcePropId}]`, true)
    },
    reloadEngine: program => {
      program.reloadEngine = !program.reloadEngine
      program.activeLinks = {}
      program.blockErrors = {}
    },
    toggleRunning: program => {
      program.engineRunning = !program.engineRunning
    },
    runtimeBlockError: (program, blockId, error) => {
      program.blockErrors[blockId] = error
    },
    updateSettings: (program, settings) => {
      Object.assign(program.config, settings)
    },
  },
  () => ({
    [blockConstants.create]: (program, blockId, name, x, y) => {
      program.loadingBlocks[blockId] = { x, y }
    },
    [blockConstants.load]: (program, blockId) => {
      const { config, loadingBlocks } = program
      const loadingBlock = loadingBlocks[blockId]
      if (loadingBlock) {
        config.blocks[blockId] = {
          x: loadingBlock.x || 0,
          y: loadingBlock.y || 0,
        }
        config.renderOrder.push(blockId)
        delete program.loadingBlocks[blockId]
      }
    },
    [blockConstants.remove]: (program, blockId) => {
      const { config, loadingBlocks } = program
      delete config.blocks[blockId]
      const renderPos = config.renderOrder.indexOf(blockId)
      if (renderPos >= 0) {
        config.renderOrder.splice(renderPos, 1)
      }
      delete loadingBlocks[blockId]
      // remove outlinks to removed block
      Object.keys(config.blocks).forEach(id => {
        const { outputLinks = {} } = config.blocks[id]
        Object.keys(outputLinks).forEach(propId => {
          const linksArray = outputLinks[propId]
          outputLinks[propId] = linksArray.filter(
            conn => Object.keys(conn)[0] !== blockId
          )
        })
      })
    },
    [blockConstants.updateProperty]: (program, blockId, name, oldName) => {
      if (name !== oldName) {
        const { config } = program
        const { outputLinks = {} } = config.blocks[blockId]
        if (outputLinks[oldName]) {
          outputLinks[name] = outputLinks[oldName]
          delete outputLinks[oldName]
        }
        // ensure any incoming links are also updated
        Object.values(config.blocks).forEach(block => {
          const { outputLinks: outputSet = {} } = block
          Object.values(outputSet).forEach(outputArray => {
            outputArray.forEach(output => {
              const bId = Object.keys(output)[0]
              const targetPropId = output[bId]
              if (bId === blockId && targetPropId === oldName) {
                output[bId] = name
              }
            })
          })
        })
      }
    },
    [blockConstants.removeProperty]: (program, blockId, propId) => {
      const { config } = program
      // remove any output links (in case its an output)
      const { outputLinks = {} } = config.blocks[blockId]
      delete outputLinks[propId]

      // if an input link
      // find any blocks that output link to this property
      Object.values(config.blocks).forEach(block => {
        Object.values(block.outputLinks || {}).forEach(outLinks => {
          const linkIndex = outLinks.findIndex(link => link[blockId] === propId)
          if (linkIndex >= 0) {
            outLinks.splice(linkIndex, 1)
          }
        })
      })
    },
    [blockConstants.persistCode]: (program, blockId, code) => {
      delete program.blockErrors[blockId]
    },
  })
)
