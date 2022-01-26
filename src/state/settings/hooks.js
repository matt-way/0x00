import definitions from './definitions'
import * as actions from './interface'
import { useSlice, useActions } from 'state-management/hooks'

const useSettings = () => {
  const settings = {
    ...useSlice('settings'),
  }
  Object.keys(definitions).forEach(type => {
    if (!settings[type]) {
      settings[type] = {}
    }
    Object.keys(definitions[type]).forEach(setting => {
      if (!settings[type][setting]) {
        settings[type][setting] = definitions[type][setting].default
      }
    })
  })
  return [settings, useSettingsActions()]
}

const useSettingsActions = () => {
  return useActions(actions)
}

export { useSettings, useSettingsActions }
