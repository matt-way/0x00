import { useStore, useActions } from 'state-management/hooks'
import * as actions from './interface'

export const useModals = () => {
  return useStore('modals', actions)
}

export const useModalActions = () => {
  return useActions(actions)
}
