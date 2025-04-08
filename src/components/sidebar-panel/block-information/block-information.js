/** @jsxImportSource theme-ui */

import Dependencies from './dependencies'
import GeneralInformation from './general-information'
import StateSettings from './state-settings'
import { invoke } from 'ipc/renderer'
import { useBlock } from 'state/blocks/hooks'
import { useToastActions } from 'state/toasts/hooks'

//import PropertyList from './property-list'

const BlockInformation = props => {
  const { id } = props
  const [block] = useBlock(id)

  const toastActions = useToastActions()

  const { dependencies = {} } = block.config

  return (
    <div
      sx={{
        position: 'relative',
        flex: 1,
      }}>
      <div
        sx={
          {
            //overflowY: 'scroll',
            //flex: 1,
          }
        }>
        <GeneralInformation blockId={id} />
        {/*<PropertyList blockId={id} />*/}
        <Dependencies
          blockId={id}
          packages={dependencies}
          uninstallDependency={invoke.blocks.uninstallDependency}
        />
        <StateSettings blockId={id} />
      </div>
    </div>
  )
}

export default BlockInformation
