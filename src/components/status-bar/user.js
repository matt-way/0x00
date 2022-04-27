/** @jsxImportSource theme-ui */
import ContextMenu from 'electron-react-context-menu/renderer'
import { useSettings } from 'state/settings/hooks'
import { signOut } from 'block-server/firebase'
import { Icon } from 'components/system'

const User = props => {
  const [settings] = useSettings()
  const { user } = settings

  // TODO: add ability to login as well
  if (!user) {
    return null
  }

  return (
    <ContextMenu
      leftClick={true}
      menu={[
        {
          label: 'Logout',
          click: () => {
            signOut()
          },
        },
      ]}>
      <div
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '0px 10px',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: '#536d88',
          },
        }}>
        <Icon
          sx={{ width: '14px', height: '14px', marginRight: '5px' }}
          type="accountOutline"
        />{' '}
        {user.displayName || user.email}
      </div>
    </ContextMenu>
  )
}

export default User
