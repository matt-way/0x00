// recursive object cleaner that allows objects to be written to disk for example
function deepCleanObject(obj) {
  if (obj === null || typeof obj !== 'object' || ArrayBuffer.isView(obj)) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(deepCleanObject)
  }

  const cleanedObj = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key]
      if (typeof value !== 'function') {
        cleanedObj[key] = deepCleanObject(value)
      }
    }
  }
  return cleanedObj
}

export { deepCleanObject }
