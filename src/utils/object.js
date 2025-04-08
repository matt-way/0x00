function isValidSerialisable(obj, seen = new Set()) {
  if (obj === null || typeof obj !== 'object') return true
  if (typeof obj === 'function') return false
  if (seen.has(obj)) return true
  seen.add(obj)

  if (Array.isArray(obj)) {
    return obj.every(item => isValidSerialisable(item, seen))
  }

  const proto = Object.getPrototypeOf(obj)
  const isPlain = proto === Object.prototype || proto === null
  if (!isPlain) return true

  for (const key in obj) {
    if (!Object.hasOwn(obj, key)) continue
    if (!isValidSerialisable(obj[key], seen)) {
      return false
    }
  }

  return true
}

// recursive object cleaner that allows objects to be written to disk for example
function deepCleanObject(obj, seen = new Map()) {
  if (obj === null || typeof obj !== 'object') return obj
  if (seen.has(obj)) return seen.get(obj)

  const proto = Object.getPrototypeOf(obj)
  const isPlain = proto === Object.prototype || proto === null

  let clone

  if (Array.isArray(obj)) {
    clone = []
    seen.set(obj, clone)
    for (const item of obj) {
      clone.push(
        typeof item === 'function' ? undefined : deepCleanObject(item, seen)
      )
    }
    return clone
  }

  if (isPlain) {
    clone = {}
    seen.set(obj, clone)
    for (const key in obj) {
      if (!Object.hasOwn(obj, key)) continue
      const val = obj[key]
      if (typeof val !== 'function') {
        clone[key] = deepCleanObject(val, seen)
      }
    }
    return clone
  }

  return obj
}

export { isValidSerialisable, deepCleanObject }
