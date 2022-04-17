import { buildModel } from 'state-management/builder'
import { constants as programConstants } from '../program/model'

export const modalIds = {
  intro: 'intro',
  dependencySearch: 'dependencySearch',
  onlineBlockSearch: 'onlineBlockSearch',
  editProperty: 'editProperty',
  confirmation: 'confirmation',
  editBlockInformation: 'editBlockInformation',
  auth: 'auth',
  colorPicker: 'colorPicker',
}

const initialState = () => ({
  openId: modalIds.intro,
})

const { actions, reducer, constants } = buildModel(
  'modals',
  initialState(),
  {
    openAt: (modals, id, pos, data) => {
      modals.openId = id
      modals.position = pos
      modals.data = data
      delete modals.responseData
    },
    close: (modals, responseData = false) => {
      delete modals.openId
      delete modals.position
      delete modals.data
      modals.responseData = responseData
    },
  },
  () => ({
    [programConstants.load]: modals => {
      delete modals.openId
      delete modals.position
      delete modals.data
    },
  })
)

export { reducer, actions, constants }
