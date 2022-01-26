// this needs to be higher than any other firebase related import
import { initFirebase } from 'block-server/firebase'
import ReactDOM from 'react-dom'
import thunk from 'redux-thunk'
import { createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import { reducer } from 'state'
import Initialisation from 'components/initialisation'
import { ThemeProvider } from 'theme-ui'
import { AppLayout } from 'components/layout'
import darkTheme from 'themes/dark'
import {
  getInitialState,
  forwardActionsToMain,
  handleMainActions,
} from 'electron-redux-ipc/renderer'
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

  handleMainActions(store)
  startWatcher(store)
  initFirebase(store)

  const App = () => (
    <Provider store={store}>
      <ThemeProvider theme={darkTheme}>
        <Initialisation>
          <AppLayout />
        </Initialisation>
      </ThemeProvider>
    </Provider>
  )

  const app = document.getElementById('app')
  ReactDOM.render(<App />, app)
}

start()
