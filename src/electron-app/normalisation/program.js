import { transform } from 'lodash'

export const normalise = (config, blockMap) => {
  // get id map
  const map = Object.keys(blockMap).reduce((output, id) => {
    output[blockMap[id].name] = id
    return output
  }, {})

  const blocks = transform(config.blocks, (result, block, name) => {
    const id = map[name]
    result[id] = {
      ...block,
      outputLinks: transform(block.outputLinks, (result, links, property) => {
        result[property] = links.map(link => {
          const key = Object.keys(link)[0]
          return {
            [map[key]]: link[key],
          }
        })
      }),
    }
  })

  const renderOrder = config.renderOrder.map(blockName => map[blockName])

  return {
    ...config,
    blocks,
    renderOrder,
  }
}

export const denormalise = (config, blocks) => {
  const mappedRenderOrder = config.renderOrder.map(
    stateId => blocks[stateId].name
  )

  const mappedBlocks = transform(config.blocks, (result, block, blockId) => {
    const cBlock = config.blocks[blockId]
    const { name } = blocks[blockId]
    result[name] = {
      ...cBlock,
      outputLinks: transform(cBlock.outputLinks, (result, links, property) => {
        result[property] = links.map(link => {
          const key = Object.keys(link)[0]
          return {
            [blocks[key].name]: link[key],
          }
        })
      }),
    }
    // dont save button input values, as they are purely used to detect
    // clicks on the button during runtime
    if (cBlock.inputValues) {
      const properties = blocks[blockId].config.block.properties
      result[name].inputValues = Object.keys(cBlock.inputValues).reduce(
        (acc, propKey) => {
          if (!(properties[propKey] && properties[propKey].type === 'button')) {
            acc[propKey] = cBlock.inputValues[propKey]
          }
          return acc
        },
        {}
      )
    }
  })

  return {
    ...config,
    blocks: mappedBlocks,
    renderOrder: mappedRenderOrder,
  }
}
