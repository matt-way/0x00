import { StatusTypes } from './model'

export const pending = (id, action) => {
  return Object.assign(action, {
    status: {
      id,
      type: StatusTypes.PENDING,
    },
  })
}

export const complete = (id, action) => {
  return Object.assign(action, {
    status: {
      id,
      type: StatusTypes.COMPLETE,
    },
  })
}

export const error = (id, error, action) => {
  return Object.assign(action, {
    status: {
      id,
      error,
      type: StatusTypes.ERROR,
    },
  })
}
