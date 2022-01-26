import { actions, modalIds } from './model'
import { subscribe, unsubscribe } from 'state-management/watcher'

export const open = (modalId, data) => dispatch => {
  return dispatch(actions.openAt(modalId, undefined, data))
}

export const openAt = (modalId, pos, data) => dispatch => {
  if (!modalIds[modalId]) {
    throw new Error(`Modal with id ${modalId} does not exist`)
  }

  dispatch(actions.openAt(modalId, pos, data))

  return new Promise(resolve => {
    const id = subscribe(`modals.responseData`, response => {
      unsubscribe(id)
      resolve(response)
    })
  })
}

export const close = actions.close
