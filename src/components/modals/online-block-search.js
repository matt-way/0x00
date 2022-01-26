/** @jsxImportSource theme-ui */
import { useState } from 'state-management/hooks'
import { PopMenu, Input, Button, Link } from 'components/system'
import { invoke } from 'ipc/renderer'
import { searchBlocks } from 'block-server/search'

const OnlineBlockSearch = props => {
  const { close } = props
  const [results, setResults] = useState(undefined, 'search--setResults')
  const [searching, setSearching] = useState(false)

  async function doSearch(searchText) {
    const info = await searchBlocks(searchText)
    setResults(info.hits)
    setSearching(false)
  }

  return (
    <PopMenu
      onClose={() => close()}
      title="Block Search"
      sx={{ minWidth: '400px' }}>
      <div
        sx={{
          display: 'flex',
          margin: '2px',
        }}>
        <Input
          sx={{
            width: '100%',
            textAlign: 'left',
          }}
          placeholder="Search Blocks"
          onChange={() => setSearching(true)}
          onChangeDebounce={e => {
            doSearch(e.target.value)
          }}
          focusOnMount={true}
        />
      </div>
      <div
        sx={{
          marginTop: '8px',
          maxHeight: '400px',
          overflowY: 'scroll',
        }}>
        {searching && <div>Searching...</div>}
        {!searching &&
          results &&
          results.map(item => (
            <div
              key={item.name}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: 'textSecondary',
                borderBottom: '1px solid #3a3a3a',
                paddingBottom: '10px',
                marginBottom: '8px',
              }}>
              <div>
                <div>
                  <span sx={{ color: 'text', fontSize: '14px' }}>
                    {item.name}
                  </span>
                  <span
                    sx={{
                      fontStyle: 'italic',
                    }}>
                    {' '}
                    - {item.version}
                  </span>
                </div>
                <div sx={{ marginTop: '2px' }}>{item.description}</div>
              </div>
              <Button
                sx={{
                  marginRight: '10px',
                }}
                onClick={() => {
                  console.log('download attempt:', item.name, item.version)
                  invoke.blocks.download(item.name, item.version)
                  close()
                }}>
                Install
              </Button>
            </div>
          ))}
      </div>
    </PopMenu>
  )
}

export default OnlineBlockSearch
