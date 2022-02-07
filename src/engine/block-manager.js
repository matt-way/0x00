import requireFromString from 'require-from-string'
import Markdown from 'marli'
import { join } from 'path'
import { subscribe, unsubscribe } from 'state-management/watcher'
import {
  addUpdateLink,
  removeLink,
  getOutgoingLinks,
  getIncomingLinks,
  activateLink,
  removeAllLinks,
} from './link-manager'
import { transpile } from './transpile'
import { TSON } from 'utils/typson'
import { writeFile, readFile } from 'fs-extra'

const md = Markdown()
const blocks = {}

// shallow link object comparer
function compareLink(a, b) {
  const aKey = Object.keys(a)[0]
  const bKey = Object.keys(b)[0]
  return aKey === bKey && a[aKey] === b[bKey]
}

function createBlock(id, block, program) {
  blocks[id] = {
    hasRan: false,
    dormant: false,
    path: block.path,
    programPath: program.path,
    main: block.config.main,
    locked: block.config.locked,
    updateBlocks: {},
    events: [],
  }

  // create the state object
  blocks[id].state = {}
  blocks[id].stateProxy = new Proxy(blocks[id].state, {
    set(obj, key, value) {
      obj[key] = value
      // set any post blocks with the updated value
      const links = getOutgoingLinks(id, key)
      links.forEach(link => {
        // flag the post blocks to be rerun with link values set
        blocks[id].updateBlocks[link.targetBlockId] = {
          ...blocks[id].updateBlocks[link.targetBlockId],
          [link.targetPropId]: {
            sourceBlockId: id,
            sourcePropId: key,
            value,
          },
        }
      })

      // if the block isn't currently in an execution pass (async state updates)
      // we need to force a post run
      if (blocks[id].dormant) {
        processPostLinks(blocks[id])
      }

      return true
    },
  })

  blocks[id].events.push(
    subscribe(`blocks.${id}.path`, newPath => {
      blocks[id].path = newPath
    })
  )

  blocks[id].events.push(
    subscribe(`blocks.${id}.saveBlockState`, saveBlockState => {
      if (saveBlockState && saveBlockState.path) {
        const toWrite = TSON.stringify(blocks[id].state)
        return writeFile(saveBlockState.path, toWrite, 'binary')
      }
    })
  )

  blocks[id].events.push(
    subscribe(`blocks.${id}.loadBlockState`, async loadBlockState => {
      if (loadBlockState && loadBlockState.path) {
        const data = await readFile(loadBlockState.path, 'binary')
        const restoredState = TSON.parse(data)

        // in order to preserve getters and setters, walk through top level keys
        Object.keys(state).forEach(k => {
          blocks[id].state[k] = restoredState[k]
        })
      }
    })
  )

  blocks[id].events.push(
    subscribe(
      `program.config.blocks.${id}.outputLinks`,
      (links = {}, prevLinks = {}) => {
        const flaggedBlocks = {}

        // removals - do first to make sure changes arent removed
        Object.keys(prevLinks).forEach(propId => {
          const newProp = links[propId] || []
          const prevProp = prevLinks[propId]

          prevProp.forEach(link => {
            if (!newProp.some(l => compareLink(l, link))) {
              const targetBlockId = Object.keys(link)[0]
              const targetPropId = link[targetBlockId]
              removeLink(id, propId, targetBlockId, targetPropId)
              flaggedBlocks[targetBlockId] = true
            }
          })
        })

        // additions/updates
        Object.keys(links).forEach(propId => {
          const newProp = links[propId]
          const prevProp = prevLinks[propId] || []
          const activated = propId in blocks[id].state

          newProp.forEach(link => {
            //if (!prevProp.includes(link)) {
            if (!prevProp.some(l => compareLink(l, link))) {
              const targetBlockId = Object.keys(link)[0]
              const targetPropId = link[targetBlockId]
              addUpdateLink(id, propId, targetBlockId, targetPropId, activated)
              // if the added/update link was active, we should run the post block
              // as inactive wouldn't run it anyway
              if (activated) {
                // propagate an activated value to the target block
                blocks[targetBlockId].state[targetPropId] =
                  blocks[id].state[propId]
                flaggedBlocks[targetBlockId] = true
              }
            }
          })
        })

        // run any flagged blocks
        Object.keys(flaggedBlocks).forEach(_id => runIfAllowed(_id))
      }
    )
  )

  blocks[id].events.push(
    subscribe(
      `program.config.blocks.${id}.inputValues`,
      (newValues, prevValues) => {
        //let shouldUpdate = false
        Object.keys(newValues).forEach(propId => {
          if (newValues[propId] !== prevValues?.[propId]) {
            blocks[id].stateProxy[propId] = newValues[propId]
            //shouldUpdate = true
          }
        })
        runIfAllowed(id)
      }
    )
  )

  // watch for code changes to run the block
  blocks[id].events.push(
    subscribe(`blocks.${id}.code`, async code => {
      // compile the code
      console.log('code changed start')
      await buildRunFunction(id, code)
      runIfAllowed(id)
    })
  )

  // rebuild and run if the dependencies change too
  blocks[id].events.push(
    subscribe(`blocks.${id}.dependencies`, async (deps, oldDeps, state) => {
      // recompile the code on dep changes
      console.log('dep change start')
      await buildRunFunction(id, state.blocks[id].code)
      runIfAllowed(id)
    })
  )

  // run the block once it becomes unlocked
  blocks[id].events.push(
    subscribe(`blocks.${id}.config.locked`, locked => {
      if (!locked) {
        delete blocks[id].locked
        runIfAllowed(id)
      }
    })
  )

  blocks[id].events.push(
    subscribe(`program.engineRunning`, (isRunning, wasRunning) => {
      blocks[id].running = isRunning
      if (wasRunning !== undefined && isRunning && blocks[id].pauseState) {
        const { hash, yieldValue } = blocks[id].pauseState
        delete blocks[id].pauseState
        runIfAllowed(id, hash, yieldValue)
      } else if (wasRunning === undefined && !isRunning) {
        // if the system starts in a paused state, we need to set each block as if it has been paused
        blocks[id].pauseState = {}
      }
    })
  )
}

function removeBlock(id) {
  // unsubscribe from state
  blocks[id].events.forEach(eventId => unsubscribe(eventId))
  delete blocks[id]
  removeAllLinks(id)
}

function attachBlockDom(id, element) {
  blocks[id].domElement = element
  runIfAllowed(id)
}

async function buildRunFunction(id, code) {
  // TODO: if the code fails to compile run() wont be set
  // and the engine will crash on this block. Need to setup a fix
  const block = blocks[id]
  const transpiledResult = transpile(id, code)
  const blockFunction = requireFromString(transpiledResult.code, id)
  block.run = blockFunction.default
}

function runIfAllowed(id, hash, yieldValue) {
  if (
    !blocks[id] ||
    !blocks[id].domElement ||
    !blocks[id].run ||
    blocks[id].locked
  ) {
    return
  }

  if (Object.values(getIncomingLinks(id)).some(link => !link.activated)) {
    return
  }

  runBlock(id, hash, yieldValue)
}

// This goes through all flagged output links needing to be run
function processPostLinks(block) {
  Object.keys(block.updateBlocks).forEach(_blockId => {
    Object.keys(block.updateBlocks[_blockId]).forEach(_propId => {
      const { sourceBlockId, sourcePropId, value } =
        block.updateBlocks[_blockId][_propId]
      blocks[_blockId].state[_propId] = value
      activateLink(sourceBlockId, sourcePropId, _blockId, _propId)
    })
    runIfAllowed(_blockId)
  })
  block.updateBlocks = {}
}

function runBlock(id, hash, yieldValue, currentTime) {
  const block = blocks[id]
  block.dormant = false

  if (!block.running) {
    block.pauseState = { hash, yieldValue }
    return
  }

  if (!hash) {
    delete block.generator
    block.hash = hash = Math.random()
  } else if (hash !== block.hash) {
    return
  }

  if (!block.generator) {
    const domHead = block.domElement.children[0]
    const domContainer = block.domElement.children[1]

    block.generator = block.run(
      block.stateProxy,
      currentTime,
      // runOnce function
      // TODO: properly handle runOnce errors
      initFunction => {
        if (!block.hasRan) {
          initFunction()
          block.hasRan = true
        }
      },
      // stateUpdated(key) function to force a propagation. Acts like an identity assignment
      stateKey => {
        block.stateProxy[stateKey] = block.stateProxy[stateKey]
      },
      // dom element
      domContainer,
      // html literal function
      (strings, ...values) => {
        // TODO: improve the cleanup of the html string to avoid unwanted #text nodes
        const html = strings
          .reduce((result, str, i) => {
            return `${result}${str}${values[i] || ''}`
          }, '')
          .replace(/(\r\n|\n|\r)/gm, '')
        domContainer.innerHTML = html
        return domContainer.childNodes
      },
      // md literal function
      (...args) => {
        const mdDom = md(...args)
        domContainer.innerHTML = ''
        domContainer.appendChild(mdDom)
        return mdDom
      },
      // require css files function
      function (relPath) {
        const link = document.createElement('link')
        link.setAttribute('rel', 'stylesheet')
        link.type = 'text/css'
        link.href = join('file://', block.path, 'node_modules', relPath)
        domHead.innerHTML = ''
        domHead.appendChild(link)
      },
      // __dirname override block path
      block.path
    )
  }

  block.generator.next(yieldValue).then(status => {
    processPostLinks(block)

    if (status.done) {
      delete block.generator
      block.dormant = true
    } else {
      requestAnimationFrame(currentTime => {
        runBlock(id, hash, status.value, currentTime)
      })
    }
  })
}

export { createBlock, removeBlock, attachBlockDom }
