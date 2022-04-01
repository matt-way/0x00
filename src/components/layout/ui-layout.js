/** @jsxImportSource theme-ui */
import { Grid, FlexBox } from 'components/system'
import { GraphPanel } from 'components/graph-panel'
import { SideBarPanel } from 'components/sidebar-panel'
import { MonacoEditor } from 'components/editor-panel'
import { useWorkspace } from 'state/workspace/hooks'
import StatusBar from 'components/status-bar'
import Modals from 'components/modals'
import Toasts from 'components/toasts'

const UILayout = props => {
  const [workspace] = useWorkspace()
  const { showSidebar } = workspace

  return (
    <Grid
      columns={showSidebar ? '3px 245px 3px auto 3px' : '3px auto 3px'}
      rows="3px auto 3px auto 3px 22px"
      sx={{
        backgroundColor: 'background',
        position: 'relative',
      }}>
      {showSidebar && (
        <FlexBox
          sx={{
            gridColumn: '2',
            gridRow: '2 / -3',
            backgroundColor: 'surface',
          }}>
          <SideBarPanel />
        </FlexBox>
      )}
      <FlexBox
        sx={{
          gridColumn: showSidebar ? '4' : '2',
          gridRow: '2',
        }}>
        <GraphPanel />
      </FlexBox>
      <FlexBox
        sx={{
          gridColumn: showSidebar ? '4' : '2',
          gridRow: '4',
          backgroundColor: 'surface',
        }}>
        {<MonacoEditor />}
      </FlexBox>
      <FlexBox
        sx={{
          gridColumn: '1 / -1',
          gridRow: '6',
          backgroundColor: 'primary',
        }}>
        <StatusBar />
      </FlexBox>
      <Modals />
      <Toasts />
    </Grid>
  )
}

export default UILayout
