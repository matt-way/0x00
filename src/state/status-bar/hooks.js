import { useStore, useActions } from 'state-management/hooks'
import * as actions from './interface'

export const useStatusBar = () => {
  return useStore('statusBar', actions)
}

export const useStatusBarActions = () => {
  return useActions(actions)
}
