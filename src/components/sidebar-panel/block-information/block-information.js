/** @jsxImportSource theme-ui */
import { useBlock } from 'state/blocks/hooks'
import { useToastActions } from 'state/toasts/hooks'
import GeneralInformation from './general-information'
//import PropertyList from './property-list'
import Dependencies from './dependencies'
import { invoke } from 'ipc/renderer'

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
      </div>
    </div>
  )
}

export default BlockInformation
