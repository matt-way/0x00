import { buildModel } from 'state-management/builder'

const initialState = () => ({})

export const StatusTypes = {
  PENDING: 'pending',
  COMPLETE: 'complete',
  ERROR: 'error',
}

export const { actions, reducer } = buildModel(
  'statuses',
  initialState(),
  {},
  () => ({}),
  (statuses, action) => {
    const { status } = action
    if (status) {
      if (!status.id) {
        console.error('no id provided for status update attempt')
      }
      statuses[status.id] = status
    }
  }
)
