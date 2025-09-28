import Program from './components/program'
import { Provider } from 'react-redux'
import ReactDOM from 'react-dom'
import { ThemeProvider } from 'theme-ui'
import { createStore } from './store'
import darkTheme from 'themes/dark'
import { setRequireStore } from './limit-node'
import { startProgramManager } from './program-manager'
import { startWatcher } from 'state-management/watcher'

async function start() {
  // hack to prevent things thinking this is node
  Object.defineProperty(process.versions, 'node', {
    value: undefined,
    configurable: true,
  })

  const store = await createStore()

  setRequireStore(store)
  startWatcher(store)
  startProgramManager()

  const App = () => (
    <Provider store={store}>
      <ThemeProvider theme={darkTheme}>
        <Program />
      </ThemeProvider>
    </Provider>
  )

  const app = document.getElementById('engine')
  ReactDOM.render(<App />, app)
}

start()
