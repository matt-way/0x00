import shortid from 'shortid'

const generateId = prefix => {
  if (prefix) {
    return `${prefix}-${shortid.generate()}`
  } else {
    return shortid.generate()
  }
}

export { generateId }
