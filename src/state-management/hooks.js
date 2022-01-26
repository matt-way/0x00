import React from 'react'
import { ReactReduxContext, useSelector as reduxSelector } from 'react-redux'
import { get, mapValues } from 'lodash'
import { createLogger } from 'utils/logger'

const log = createLogger('state.hooks', 'blue')

export const useState = (initialState, analyticsId) => {
  return React.useState(initialState)
}

export const useSlice = slice => {
  return reduxSelector(state => (slice ? get(state, slice) : state))
}

export const useActions = actions => {
  const { store } = React.useContext(ReactReduxContext)
  const { dispatch } = store
  return mapValues(actions, (func, key) => async (...params) => {
    log(`(${key}) - thunk started`)
    const res = await dispatch(func(...params))
    log(`(${key}) - thunk completed`)
    return res
  })
}

export const useStore = (slice, actions) => {
  return [useSlice(slice), useActions(actions)]
}

export const useSelector = (selector, ...args) => {
  const state = useSlice()
  return selector(state, ...args)
}
