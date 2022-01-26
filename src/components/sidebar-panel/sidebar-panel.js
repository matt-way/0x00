/** @jsxImportSource theme-ui */
import { useWorkspace } from 'state/workspace/hooks'
import { BlockInformation } from './block-information'

const SideBarPanel = props => {
  const [workspace, workspaceActions] = useWorkspace()
  const { selectedBlockId } = workspace

  return (
    <div>
      {selectedBlockId && (
        <BlockInformation key={selectedBlockId} id={selectedBlockId} />
      )}
    </div>
  )
}

export default SideBarPanel
