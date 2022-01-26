import { useSlice, useActions } from 'state-management/hooks'
import { mapValues } from 'lodash'
import * as actions from './interface'

export const useBlockActions = id => {
  return useActions(mapValues(actions, f => f.bind(undefined, id)))
}

export const useBlock = id => {
  const block = useSlice(`blocks[${id}]`)
  return [block, useBlockActions(id)]
}

export const useSelectedBlock = () => {
  const selectedId = useSlice(`workspace.selectedBlockId`)
  return useBlock(selectedId)
}
