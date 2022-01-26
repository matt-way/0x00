import { buildModel } from 'state-management/builder'
import { constants as programConstants } from '../program/model'
import { get, set } from 'lodash'

const initialState = {}

const { actions, reducer, constants } = buildModel(
  'settings',
  initialState,
  {
    update: (settings, values) => values,
    updateExternal: (settings, values) => values,
    updateValue: (settings, path, value) => {
      set(settings, path, value)
      return settings
    },
    removePath: (settings, path) => {
      set(settings, path, undefined)
      return settings
    },
  },
  () => ({
    [programConstants.load]: (settings, programFolder, configPath) => {
      const recentPrograms = get(settings, 'system.recentPrograms') || []
      const currentIndex = recentPrograms.indexOf(configPath)
      if (currentIndex >= 0) {
        recentPrograms.splice(currentIndex, 1)
      }
      recentPrograms.unshift(configPath)
      set(settings, 'system.recentPrograms', recentPrograms)
    },
  })
)

export { actions, reducer, constants }
