import { nanoid } from 'nanoid'

const ID_LENGTH = 10

const generateId = prefix => {
  if (prefix) {
    return `${prefix}-${nanoid(ID_LENGTH)}`
  } else {
    return nanoid(ID_LENGTH)
  }
}

export { generateId }
