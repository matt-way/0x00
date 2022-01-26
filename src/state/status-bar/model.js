import { buildModel } from 'state-management/builder'

const initialState = () => ({
  info: [],
})

export const { actions, reducer, constants } = buildModel(
  'statusBar',
  initialState(),
  {
    setInfo: (statusBar, id, text) => {
      const newList = statusBar.info.filter(item => item.id !== id)
      newList.push({
        id,
        text,
      })
      statusBar.info = newList
    },
    removeItem: (statusBar, id) => {
      statusBar.info = statusBar.info.filter(item => item.id !== id)
    },
  }
)
