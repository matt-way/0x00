/** @jsxImportSource theme-ui */
import { Flex } from 'components/system'
import { useStatusBar } from 'state/status-bar/hooks'
import User from './user'

const StatusBar = props => {
  const [statusBarData] = useStatusBar()
  const { info = [] } = statusBarData

  return (
    <Flex
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        height: '100%',
      }}>
      <div>{info.length > 0 && info[info.length - 1].text}</div>
      <User />
    </Flex>
  )
}

export default StatusBar
