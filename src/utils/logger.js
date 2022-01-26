import isDev from './is-dev'
import Deque from 'double-ended-queue'

const CACHE_SIZE = 50
const logQueue = new Deque(CACHE_SIZE)

let enabled = isDev()
let realtime = true

const matchesFilter = (category, filter) => {
  return category.startsWith(filter)
}

const log = item => {
  console.log(`%c[${item.category}]`, `color: ${item.colour}`, ...item.args)
}

export const setEnabled = _enabled => (enabled = _enabled)
export const setRealtime = _realtim => (realtime = _realtime)

export const createLogger =
  (category, colour) =>
  (...args) => {
    if (enabled) {
      const item = {
        category,
        colour,
        args,
      }
      logQueue.push(item)
      if (logQueue.length > CACHE_SIZE) {
        logQueue.shift()
      }
      if (realtime) {
        log(item)
      }
    }
  }

export const dump = filter => {
  console.log(
    filter
      ? `Dumping log for filter: ${filter} --------`
      : 'Dumping log --------'
  )
  logQueue
    .toArray()
    .filter(item => !filter || matchesFilter(item.category, filter))
    .forEach(log)
}
