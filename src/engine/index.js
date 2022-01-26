import { setRequireStore } from './limit-node'
import ReactDOM from 'react-dom'
import thunk from 'redux-thunk'
import { createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import { reducer } from 'state'
import { ThemeProvider } from 'theme-ui'
import darkTheme from 'themes/dark'
import {
  getInitialState,
  forwardActionsToMain,
  handleMainActions,
} from 'electron-redux-ipc/renderer'
import { startProgramManager } from './program-manager'
import Program from './components/program'
import { startWatcher } from 'state-management/watcher'

async function start() {
  const initialState = await getInitialState()

  const composeEnhancers =
    (typeof window !== 'undefined' &&
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
    compose
  const enhancer = composeEnhancers(
    applyMiddleware(thunk, forwardActionsToMain)
  )
  const store = createStore(reducer, initialState, enhancer)

  setRequireStore(store)

  handleMainActions(store)
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
