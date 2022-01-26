import { useStore } from 'state-management/hooks'
import * as actions from './interface'

export const useWorkspace = () => {
  return useStore('workspace', actions)
}
