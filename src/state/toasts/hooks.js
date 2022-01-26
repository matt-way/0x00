import { useStore, useActions } from 'state-management/hooks'
import * as actions from './interface'

export const useToasts = () => {
  return useStore('toasts', actions)
}

export const useToastActions = () => {
  return useActions(actions)
}
