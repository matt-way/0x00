import store from './store'
import chokidar from 'chokidar'
import { app } from 'electron'
import { join } from './disk/path'
import { readJson, readJsonSync, writeJson, existsSync } from './disk/fs'
import { debounce, isEqual } from 'lodash'
import { subscribe } from 'state-management/watcher'
import * as actions from 'state/settings/interface'

const USER_SETTINGS_FILE = 'user-settings.json'
const USER_SETTINGS_PATH = join(app.getPath('userData'), USER_SETTINGS_FILE)

const readSettings = () => {
  return readJson(USER_SETTINGS_PATH)
}

const readSettingsSync = () => {
  if (existsSync(USER_SETTINGS_PATH)) {
    return readJsonSync(USER_SETTINGS_PATH)
  }
  return {}
}

const writeSettings = debounce(data => {
  writeJson(USER_SETTINGS_PATH, data)
}, 500)

const initSettings = () => {
  subscribe('settings', writeSettings)

  chokidar
    .watch(USER_SETTINGS_PATH, {
      ignoreInitial: true,
    })
    .on('change', async () => {
      const newSettings = await readSettings()
      const { settings } = store.getState()
      if (!isEqual(newSettings, settings)) {
        store.dispatch(actions.updateExternal(newSettings))
      }
    })
}

export { readSettings, readSettingsSync, initSettings }
