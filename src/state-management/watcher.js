import { get, has, uniqueId } from 'lodash'

const subscriptions = []
let _store
let _unsubscribeStore

const defaultComparer = (prev, next) => prev === next

const processSubscription = (sub, state) => {
  const currentValue = get(state, sub.path)
  if (!sub.comparer(sub.lastValue, currentValue)) {
    sub.fn(currentValue, sub.lastValue, state, sub.id)
    sub.lastValue = currentValue
  }
}

const initialiseSubscription = (sub, state) => {
  if (!has(sub.lastValue)) {
    sub.lastValue = undefined
    processSubscription(sub, state)
  }
}

export const startWatcher = store => {
  if (_unsubscribeStore) {
    throw new Error('redux watcher has already been started')
  }

  _store = store

  // initialise all the subscriptions as the store has now been set
  subscriptions.forEach(sub => initialiseSubscription(sub, store.getState()))

  // setup the redux subscriber
  _unsubscribeStore = store.subscribe(() => {
    subscriptions.forEach(sub => processSubscription(sub, store.getState()))
  })
}

export const stopWatcher = () => {
  if (_unsubscribeStore) {
    _unsubscribeStore()
    _unsubscribeStore = null
    _store = null
  }
}

export const subscribe = (path, fn, comparer = defaultComparer) => {
  const id = uniqueId()
  const sub = {
    id,
    path,
    fn,
    comparer,
  }
  subscriptions.push(sub)

  // if the store has already been setup initialise the subscription
  if (_store) {
    initialiseSubscription(sub, _store.getState())
  }

  return id
}

export const unsubscribe = id => {
  const index = subscriptions.findIndex(sub => sub.id === id)
  if (index >= 0) {
    subscriptions.splice(index, 1)
  }
}
