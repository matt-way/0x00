/** @jsxImportSource theme-ui */

import { Button, Input, Link, PopMenu } from 'components/system'

import { invoke } from 'ipc/renderer'
import { searchDependencies } from 'utils/jsdelivr'
import { useSelectedBlock } from 'state/blocks/hooks'
import { useState } from 'state-management/hooks'

const DependencySearch = props => {
  const { close } = props
  const [block] = useSelectedBlock()
  const [results, setResults] = useState(null, 'dependency-search-results')

  async function doSearch(searchText) {
    const info = await searchDependencies(searchText)
    setResults(info.hits)
  }

  return (
    <PopMenu
      onClose={() => close()}
      title="Dependency Search"
      sx={{
        width: '600px',
      }}>
      <Input
        sx={{
          width: '100%',
          textAlign: 'left',
        }}
        onChange={e => doSearch(e.target.value)}
        focusOnMount={true}
      />
      <div
        sx={{
          marginTop: '8px',
          maxHeight: '400px',
          overflowY: 'scroll',
        }}>
        {results &&
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
                {item.githubRepo && (
                  <Link
                    url={`https://github.com/${item.githubRepo.user}/${item.githubRepo.project}`}
                    sx={{ fontSize: '11px' }}>
                    {`https://github.com/${item.githubRepo.user}/${item.githubRepo.project}`}
                  </Link>
                )}
              </div>
              <Button
                sx={{
                  marginRight: '10px',
                }}
                onClick={() => {
                  invoke.blocks.installDependency(block.id, item)
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

export default DependencySearch
