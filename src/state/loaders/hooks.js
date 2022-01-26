import { useSlice, useActions } from 'state-management/hooks'
import { mapValues } from 'lodash'
import * as actions from './interface'

export const useLoaderActions = key => {
  return useActions(mapValues(actions, f => f.bind(undefined, key)))
}

export const useLoader = key => {
  const loader = useSlice(`loaders[${key}]`)
  return [loader || {}, useLoaderActions(key)]
}
