/** @jsxImportSource theme-ui */
import { useProgram } from 'state/program/hooks'
import { Flex, FlexBox } from 'components/system'
import Toolbar from './toolbar'
import GraphRenderer from './graph-renderer'

const GraphPanel = props => {
  const [program, programActions] = useProgram()

  return (
    <Flex
      direction="column"
      sx={{
        height: '100%',
        userSelect: 'none',
        backgroundColor: 'surfaceHigh',
        borderRadius: '5px 5px 0px 0px',
      }}>
      <FlexBox flex={0}>
        <Toolbar />
      </FlexBox>
      {program.config && (
        <GraphRenderer
          program={program.config}
          programActions={programActions}
        />
      )}
    </Flex>
  )
}

export default GraphPanel
