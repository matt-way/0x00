import { buildModel } from 'state-management/builder'
import { constants as blockConstants } from '../blocks/model'

const initialState = () => ({
  engineRunning: true,
  loadingBlocks: {},
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
    updateBlockPosition: (program, blockId, deltaX, deltaY) => {
      const block = program.config.blocks[blockId]
      // check for block existence here, as its possible a move event might be triggered
      // after a removal
      if (block) {
        block.x += deltaX
        block.y += deltaY
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
    dragHub: (program, sourceBlockId, sourcePropId, isOutput) => {
      program.linkDragging = {
        sourceBlockId,
        sourcePropId,
        isOutput,
      }
    },
    dropHub: (program, targetBlockId, targetPropId) => {
      const { config, linkDragging } = program
      const { sourceBlockId, sourcePropId, isOutput } = linkDragging

      let sBlockId = sourceBlockId,
        sPropId = sourcePropId,
        tBlockId = targetBlockId,
        tPropId = targetPropId
      if (!isOutput) {
        sBlockId = targetBlockId
        sPropId = targetPropId
        tBlockId = sourceBlockId
        tPropId = sourcePropId
      }

      // the target should only ever have one incoming link
      // so remove any others that might exist
      Object.keys(config.blocks).forEach(bId => {
        const block = config.blocks[bId]
        Object.keys(block.outputLinks || {}).forEach(linkSourceId => {
          const links = block.outputLinks[linkSourceId]
          const linkIndex = links.findIndex(l => l[tBlockId] === tPropId)
          if (linkIndex >= 0) {
            links.splice(linkIndex, 1)
          }
        })
      })

      const block = config.blocks[sBlockId]
      if (!block.outputLinks) {
        block.outputLinks = {}
      }
      block.outputLinks[sPropId] = [
        ...(block.outputLinks[sPropId] || []),
        {
          [tBlockId]: tPropId,
        },
      ]
      delete program.linkDragging
      delete program.creatingLink
    },
    creatingLink: (program, blockId) => {
      program.creatingLink = blockId
    },
    cancelLinkDragDrop: program => {
      delete program.linkDragging
      delete program.creatingLink
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
    },
    reloadEngine: program => {
      program.reloadEngine = !program.reloadEngine
    },
    toggleRunning: program => {
      program.engineRunning = !program.engineRunning
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
  })
)
