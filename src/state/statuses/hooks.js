import { useSlice } from 'state-management/hooks'
import { getDependencyId } from '../blocks/utils'

export const useDependencyStatus = (blockId, packageName) => {
  return useSlice(`statuses.${getDependencyId(blockId, packageName)}`)
}
