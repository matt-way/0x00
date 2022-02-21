import { buildModel } from 'state-management/builder'
import { constants as programConstants } from '../program/model'
import { constants as blockConstants } from '../blocks/model'

const initialState = () => ({
  selectedBlockId: null,
  enginePanelAttached: true,
})

export const { constants, actions, reducer } = buildModel(
  'workspace',
  initialState(),
  {
    selectBlock: (workspace, blockId) => {
      workspace.selectedBlockId = blockId
    },
    toggleEnginePanelAttached: workspace => {
      workspace.enginePanelAttached = !workspace.enginePanelAttached
    },
  },
  () => ({
    [programConstants.reset]: () => initialState(),
    [blockConstants.remove]: (workspace, blockId) => {
      if (workspace.selectedBlockId === blockId) {
        workspace.selectedBlockId = null
      }
    },
    [blockConstants.load]: (
      workspace,
      blockId,
      name,
      path,
      config,
      code,
      dependencies
    ) => {
      if (!workspace.selectedBlockId) {
        workspace.selectedBlockId = blockId
      }
    },
  })
)
