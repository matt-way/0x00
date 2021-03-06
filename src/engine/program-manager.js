import { subscribe } from 'state-management/watcher'
import { difference } from 'lodash'
import { createBlock, removeBlock } from './block-manager'

function startProgramManager() {
  subscribe(
    'program.config.blocks',
    (blockInstances = {}, prevBlockInstances = {}, { blocks, program }) => {
      const newIds = Object.keys(blockInstances)
      const oldIds = Object.keys(prevBlockInstances)

      const toRemove = difference(oldIds, newIds)
      toRemove.forEach(id => removeBlock(id))

      const toAdd = difference(newIds, oldIds)
      toAdd.forEach(id => createBlock(id, blocks[id], program))
    }
  )
}

export { startProgramManager }
