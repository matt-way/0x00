import { setRequireStore } from './limit-node'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'theme-ui'
import darkTheme from 'themes/dark'
import { startProgramManager } from './program-manager'
import Program from './components/program'
import { startWatcher } from 'state-management/watcher'
import { createStore } from './store'

async function start() {
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
