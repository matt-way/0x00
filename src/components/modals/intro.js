/** @jsxImportSource theme-ui */
import { invoke } from 'ipc/renderer'
import { useSettings } from 'state/settings/hooks'
import { PopMenu, Button } from 'components/system'

const Intro = props => {
  const { close } = props
  const [settings] = useSettings('system')

  return (
    <PopMenu
      top={-50}
      sx={{
        //backgroundColor: 'red',
        //padding: '100px 100px 200px 100px',
        paddingLeft: '100px',
        paddingBottom: '100px',
        paddingTop: '300px',
        paddingRight: '100px',
        position: 'relative',
        backgroundColor: '#242424',
        overflow: 'hidden',
        width: '500px',
      }}>
      <img
        sx={{
          position: 'absolute',
          width: '400px',
          left: '50px',
          top: '-50px',
          zIndex: -1,
        }}
        src="asset:///images/header_back.png"
      />
      <div
        sx={{
          fontSize: 18,
          marginBottom: '15px',
        }}>
        Start
      </div>
      <Button
        sx={{
          marginBottom: '10px',
          display: 'block',
          padding: '6px 12px',
        }}
        onClick={async () => {
          if (await invoke.program.create()) {
            close()
          }
        }}>
        Create new program
      </Button>
      <Button
        sx={{
          marginBottom: '30px',
          display: 'block',
          padding: '6px 12px',
        }}
        onClick={async () => {
          const path = await invoke.program.open()
          if (path) {
            close()
          }
        }}>
        Open Program
      </Button>
      <div
        sx={{
          marginBottom: '10px',
          fontSize: 18,
        }}>
        Recent
      </div>
      <div>
        {settings?.system?.recentPrograms?.slice(0, 5).map(path => {
          const parts = path.split(/[/\\]+/)
          return (
            <Button
              sx={{
                padding: '6px 12px',
                marginBottom: '10px',
              }}
              key={path}
              onClick={async () => {
                if (await invoke.program.open(path)) {
                  close()
                }
              }}>
              <span sx={{}}>{parts[parts.length - 2]}</span>
              <span
                sx={{
                  fontSize: 11,
                  fontStyle: 'italic',
                  marginLeft: '10px',
                }}>
                {parts.slice(0, -2).join('/')}
              </span>
            </Button>
          )
        })}
      </div>
    </PopMenu>
  )
}

export default Intro
