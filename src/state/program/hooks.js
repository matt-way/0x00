import { useStore, useActions } from 'state-management/hooks'
import * as actions from './interface'

export const useProgramActions = () => {
  return useActions(actions)
}

export const useProgram = () => {
  return useStore('program', actions)
}
