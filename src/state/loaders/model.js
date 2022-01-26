import { buildModel } from 'state-management/builder'

const initialState = () => ({})

const { actions, reducer, constants } = buildModel('loaders', initialState(), {
  startLoading: (loaders, key) => {
    loaders[key] = {
      loading: true,
      loaded: false,
      progress: 0,
      error: undefined,
    }
  },
  loaded: (loaders, key) => {
    loaders[key].loading = false
    loaders[key].loaded = true
  },
})

export { actions, reducer, constants }
