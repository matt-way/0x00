import { actions, TOAST_TYPES } from './model'

export const add = actions.addToast

export const addInfo = (id, title, message) => dispatch =>
  dispatch(actions.addToast(id, title, message, TOAST_TYPES.info))

export const addSuccess = (id, title, message) => dispatch =>
  dispatch(actions.addToast(id, title, message, TOAST_TYPES.success))

export const addWarning = (id, title, message) => dispatch =>
  dispatch(actions.addToast(id, title, message, TOAST_TYPES.warning))

export const addError = (id, title, message) => dispatch =>
  dispatch(actions.addToast(id, title, message, TOAST_TYPES.error))

export const remove = actions.removeToast
