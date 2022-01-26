import { buildModel } from 'state-management/builder'

export const modalIds = {
  intro: 'intro',
  dependencySearch: 'dependency-search',
  onlineBlockSearch: 'online-block-search',
  editInputProperty: 'edit-input-property',
  editOutputProperty: 'edit-output-property',
  confirmation: 'confirmation',
  editBlockInformation: 'editBlockInformation',
  auth: 'auth',
}

const initialState = () => ({
  openId: modalIds.intro,
})

const { actions, reducer, constants } = buildModel('modals', initialState(), {
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
})

export { reducer, actions, constants }
