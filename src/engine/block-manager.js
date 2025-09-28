import * as blockActions from 'state/blocks/interface'
import * as programActions from 'state/program/interface'

import {
  activateLink,
  addUpdateLink,
  getIncomingLinks,
  getOutgoingLinks,
  linkExists,
  removeAllLinks,
  removeLink,
} from './link-manager'
import { isAbsolute, join } from 'path'
import { readFile, writeFile } from 'fs-extra'
import { subscribe, unsubscribe } from 'state-management/watcher'

import { getStore } from './store'
import { isValidSerialisable } from 'utils/object'
import { md } from 'utils/markdown-literal'
import requireFromString from 'require-from-string'
import { transpile } from './transpile'
import v8 from 'v8'

//import { isEqual } from 'lodash'

const blocks = {}

// shallow link object comparer
function compareLink(a, b) {
  const aKey = Object.keys(a)[0]
  const bKey = Object.keys(b)[0]
  return aKey === bKey && a[aKey] === b[bKey]
}

async function createBlock(id, block, program) {
  blocks[id] = {
    path: block.path,
    programPath: program.path,
    main: block.config.main,
    locked: block.config.locked,
    forceRun: block.config.forceRun,
    runIndex: 0, // this keeps track of which run function we have run

    outputLinkChanges: {},
    updateBlocks: {},
    paused: false,
    enginePaused: false,
    pauseState: [],
    onChangeStore: [],

    hasRan: false,
    dormant: false,

    events: [],
    changeDeps: {},
    removeFuncs: {},
    framesPerRAF: 1,
    frameCounter: 0,
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
    subscribe(`blocks.${id}.saveBlockState`, (saveBlockState, prev, state) => {
      if (saveBlockState && saveBlockState.path) {
        const clone = Object.keys(blocks[id].state).reduce((acc, key) => {
          // ensure no input property state is saved
          const { inputValues = {} } = state.program.config.blocks[id]
          // ensure no inlink state is saved as that should be the responsibility of the source block
          const inLinks = getIncomingLinks(id)
          if (inputValues[key] || inLinks[key]) {
            return acc
          }

          if (isValidSerialisable(blocks[id].state[key])) {
            acc[key] = blocks[id].state[key]
          }
          return acc
        }, {})

        const toWrite = v8.serialize(clone)
        writeFile(saveBlockState.path, toWrite, 'binary')
        getStore().dispatch(blockActions.saveStateComplete(id))
      }
    })
  )

  blocks[id].events.push(
    subscribe(`blocks.${id}.loadBlockState`, async loadBlockState => {
      if (loadBlockState && loadBlockState.path) {
        const data = await readFile(loadBlockState.path)
        const restoredState = v8.deserialize(data)
        getStore().dispatch(blockActions.loadStateComplete(id))

        // in order to preserve getters and setters, walk through top level keys
        Object.keys(restoredState).forEach(k => {
          blocks[id].stateProxy[k] = restoredState[k]
        })

        attemptRun(id)
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
        Object.keys(flaggedBlocks).forEach(_id => attemptRun(_id))
      }
    )
  )

  blocks[id].events.push(
    subscribe(
      `program.config.blocks.${id}.inputValues`,
      (newValues, prevValues, state) => {
        Object.keys(newValues).forEach(propId => {
          if (newValues[propId] !== prevValues?.[propId]) {
            // if the property is a file selector, we might get a relative path back
            // so we should resolve the static path in this case
            const block = state.blocks[id].config.block
            if (
              block.properties[propId] &&
              block.properties[propId].type === 'fileSelector' &&
              !isAbsolute(newValues[propId])
            ) {
              blocks[id].stateProxy[propId] = join(
                blocks[id].path,
                newValues[propId]
              )
            } else {
              blocks[id].stateProxy[propId] = newValues[propId]
            }
          }
        })
        attemptRun(id)
      }
    )
  )

  // watch for code changes to run the block
  blocks[id].events.push(
    subscribe(`blocks.${id}.code`, async code => {
      blocks[id].codeInitialised = true
      if (await buildRunFunction(id, code)) {
        attemptRun(id)
      }
    })
  )

  // rebuild and run if the dependencies change too
  blocks[id].events.push(
    subscribe(`blocks.${id}.dependencies`, async (deps, oldDeps, state) => {
      blocks[id].depsInitialised = true
      if (await buildRunFunction(id, state.blocks[id].code)) {
        attemptRun(id)
      }
    })
  )

  // run the block once it becomes unlocked
  blocks[id].events.push(
    subscribe(`blocks.${id}.config.locked`, locked => {
      if (!locked) {
        blocks[id].locked = false
        attemptRun(id)
      }
    })
  )

  blocks[id].events.push(
    subscribe(`program.engineRunning`, (isRunning, wasRunning) => {
      blocks[id].enginePaused = !isRunning
      if (wasRunning !== undefined && isRunning) {
        resumeBlock(id)
      }
    })
  )

  blocks[id].events.push(
    subscribe(`program.config.framesPerRAF`, _framesPerRAF => {
      blocks[id].framesPerRAF = _framesPerRAF
    })
  )

  blocks[id].events.push(
    subscribe(
      `blocks.${id}.config.block.paused`,
      (isPaused, wasPaused, state) => {
        blocks[id].paused = isPaused
        if (!isPaused && wasPaused) {
          resumeBlock(id)
        }
      }
    )
  )

  blocks[id].events.push(
    subscribe(`blocks.${id}.config.block.forceRun`, (isForced, wasForced) => {
      blocks[id].forceRun = isForced
      if (isForced) {
        attemptRun(id)
      }
    })
  )

  // once the state proxy is built (and subscriptions managed), if the block has a state loader on reset set the appropriate keys here
  if (program.config?.blocks?.[id]?.autoloadStatePath) {
    const statePath = join(
      program.path,
      program.config.blocks[id].autoloadStatePath
    )
    const data = await readFile(statePath)
    const restoredState = v8.deserialize(data)
    Object.keys(restoredState).forEach(k => {
      blocks[id].stateProxy[k] = restoredState[k]
    })
    console.log(`State auto loaded for ${block.name}`)
  }
}

function removeBlock(id) {
  // unsubscribe from state
  blocks[id].events.forEach(eventId => unsubscribe(eventId))

  // run removal function if applicable
  for (let i = 0; i < blocks[id].changeIndex; i++) {
    const removeFunc = blocks[id].removeFuncs[i]
    if (removeFunc && typeof removeFunc === 'function') {
      removeFunc()
    }
  }

  delete blocks[id]
  removeAllLinks(id)
}

function attachBlockDom(id, element) {
  blocks[id].domElement = element
  attemptRun(id)
}

async function buildRunFunction(id, code) {
  // TODO: if the code fails to compile run() wont be set
  // and the engine will crash on this block. Need to setup a fix
  const block = blocks[id]
  if (!block.codeInitialised || !block.depsInitialised) {
    return false
  }
  const transpiledResult = transpile(id, block, code)
  //const blockFunction = requireFromString(transpiledResult.code, id)
  const codeUrl = `data:text/javascript;base64,${Buffer.from(
    transpiledResult.code,
    'utf8'
  ).toString('base64')}`
  // the webpack ignore must go here so that webpack doesnt try and handle this import in any way
  const mod = await import(/* webpackIgnore: true */ codeUrl)
  //block.runFunction = blockFunction.default
  block.runFunction = mod.default
  return true
}

// This goes through all flagged output links needing to be run
function processPostLinks(block) {
  Object.keys(block.updateBlocks).forEach(_blockId => {
    let shouldAttemptRun = false
    Object.keys(block.updateBlocks[_blockId]).forEach(_propId => {
      const { sourceBlockId, sourcePropId, value } =
        block.updateBlocks[_blockId][_propId]
      // only set if the link is still valid
      if (linkExists(sourceBlockId, sourcePropId, _blockId, _propId)) {
        blocks[_blockId].state[_propId] = value
        if (activateLink(sourceBlockId, sourcePropId, _blockId, _propId)) {
          // if a link is successfully activated, then tell the UI
          getStore().dispatch(
            programActions.activateLink(sourceBlockId, sourcePropId)
          )
        }
        shouldAttemptRun = true
      }
    })
    if (shouldAttemptRun) {
      attemptRun(_blockId)
    }
  })
  block.updateBlocks = {}
}

function isBlockPaused(block) {
  return block.paused || block.enginePaused
}

function attemptRun(id) {
  const block = blocks[id]
  if (!block || !block.domElement || !block.runFunction || block.locked) {
    return
  }

  if (
    !block.forceRun &&
    Object.values(getIncomingLinks(id)).some(link => !link.activated)
  ) {
    return
  }

  if (isBlockPaused(block)) {
    block.scheduleRun = true
    return
  }

  // if the block is set to force run, then it is able to be a part
  // of feedback loops that can cause blocking, so force any of these
  // to run in a raf
  if (block.forceRun) {
    requestAnimationFrame(() => {
      runBlock(id)
    })
  } else {
    runBlock(id)
  }
}

async function runBlock(id) {
  const block = blocks[id]
  if (!block) {
    return
  }

  block.runIndex++
  block.onChangeIndex = 0

  // TODO: we need to prevent the previous run from continuing
  if (block.pauseState.length > 0) {
    block.pauseState.forEach(p => p.cancel())
    block.pauseState = []
  }

  // reset the run scheduler
  block.scheduleRun = false

  try {
    const domContainer = block.domElement.children[1]
    await block.runFunction(
      block.stateProxy, // state object
      domContainer, // dom element
      {
        raf: createRafWrapper(block),
        timeout: createTimeoutWrapper(block),
        //intervalWrapper,
        //awaitWrapper
      },
      // stateUpdated(key) function to force a propagation. Acts like an identity assignment
      stateKey => {
        block.stateProxy[stateKey] = block.stateProxy[stateKey]
      },
      // onChange function
      async function (func, deps = [], ignoreInitialLoad) {
        const prevStore =
          block.onChangeStore[block.onChangeIndex] ||
          (block.onChangeStore[block.onChangeIndex] = {})
        const { deps: prevDeps } = prevStore

        if (ignoreInitialLoad && prevDeps === undefined) {
          prevStore.deps = deps
        } else if (
          prevDeps === undefined ||
          deps.length !== prevDeps.length ||
          deps.some((d, i) => d !== prevDeps[i])
        ) {
          prevStore.removeFunc = await func()
          prevStore.deps = deps
        }
        block.onChangeIndex++
      },
      createHtmlHelper(domContainer),
      createMdHelper(domContainer),
      //cssHelper,
      // __dirname override block path
      block.path
    )

    processPostLinks(block)
  } catch (err) {
    console.error(err)
    getStore().dispatch(programActions.runtimeBlockError(id, err))
  }
}

// html literal function
function createHtmlHelper(container) {
  return (strings, ...values) => {
    // TODO: improve the cleanup of the html string to avoid unwanted #text nodes
    const html = strings
      .reduce((result, str, i) => {
        return `${result}${str}${values[i] || ''}`
      }, '')
      .replace(/(\r\n|\n|\r)/gm, '')
    container.innerHTML = html

    if (container.childNodes.length === 1) {
      return container.childNodes[0]
    }
    return container.childNodes
  }
}

function createMdHelper(container) {
  return (...args) => {
    const mdDom = md(...args)
    container.innerHTML = mdDom
  }
}

function createRafWrapper(block) {
  // store the current run index in the closure
  const runIndex = block.runIndex
  return callback => {
    if (isBlockPaused(block)) {
      block.pauseState.push({
        resume: () => {
          requestAnimationFrame(ms => {
            callback(ms)
            processPostLinks(block)
          })
        },
        cancel: () => {
          // to cancel a raf just dont run it
          return
        },
      })
    } else {
      // simply run the raf
      requestAnimationFrame(ms => {
        // cancel if run index was updated
        if (runIndex !== block.runIndex) {
          return
        }
        callback(ms)
        processPostLinks(block)
      })
    }
  }
}

function createTimeoutWrapper(block) {
  const runIndex = block.runIndex
  return (callback, ms) => {
    setTimeout(() => {
      if (runIndex !== block.runIndex) {
        return
      }
      if (isBlockPaused(block)) {
        block.pauseState.push({
          resume: () => {
            callback()
            processPostLinks(block)
          },
          cancel: () => {
            // to cancel just dont run setTimeout
            return
          },
        })
      } else {
        callback()
        processPostLinks(block)
      }
    }, ms)
  }
}

async function resumeBlock(id) {
  const block = blocks[id]
  if (!block || isBlockPaused(block)) {
    return
  }
  if (block.scheduleRun) {
    attemptRun(id)
  } else {
    block.pauseState.forEach(p => p.resume())
    block.pauseState = []
  }
}

export { createBlock, removeBlock, attachBlockDom }
