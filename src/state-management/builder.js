import produce from 'immer'
import { createLogger } from 'utils/logger'

const log = createLogger('state.builder', 'orchid')

const buildModel = (
  prefix,
  initialState,
  handlerDefs,
  customHandlers = () => ({}),
  customReducer
) => {
  const constants = {}
  const actions = {}
  const handlers = {}

  Object.keys(handlerDefs).forEach(name => {
    const constant = `${prefix}/${name}`
    constants[name] = constant

    // NOTE: type and arg checking could be added here
    actions[name] = (...values) => ({
      values,
      type: constant,
    })

    handlers[constant] = (...args) => {
      const [_, ...params] = args
      //log(`(${constant}) ->`, params)
      log(`[${constant}]`)
      return handlerDefs[name](...args)
    }
  })

  let customHandlerCache
  const getCustomHandlers = () => {
    if (!customHandlerCache) {
      customHandlerCache = customHandlers()
    }
    return customHandlerCache
  }

  const reducer = (state = initialState, action) => {
    const handler = handlers[action.type] || getCustomHandlers()[action.type]

    if (handler) {
      return produce(state, draft => handler(draft, ...action.values))
    }

    if (customReducer) {
      return produce(state, draft => customReducer(draft, action))
    }

    return state
  }

  return {
    constants,
    actions,
    handlers,
    reducer,
    prefix,
  }
}

export { buildModel }
