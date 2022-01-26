/** @jsxImportSource theme-ui */
import { Flex, FlexBox } from 'components/system'
import UILayout from './ui-layout'
import { EnginePanel, EngineControls } from 'components/engine'
import { useWorkspace } from 'state/workspace/hooks'

const AppLayout = props => {
  const [workspace] = useWorkspace()

  return (
    <Flex direction="row" fill sx={{ height: '100vh' }}>
      <FlexBox flex={2}>
        <UILayout />
      </FlexBox>
      {workspace.enginePanelAttached && (
        <FlexBox>
          <EngineControls rounded={true} />
          <EnginePanel />
        </FlexBox>
      )}
    </Flex>
  )
}

export default AppLayout
