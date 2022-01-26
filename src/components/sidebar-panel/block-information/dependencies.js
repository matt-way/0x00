/** @jsxImportSource theme-ui */
import { useRef } from 'react'
import { useModalActions } from 'state/modals/hooks'
import { modalIds } from 'state/modals/model'
import { useDependencyStatus } from 'state/statuses/hooks'
import { Button, Icon, IconButton, Flex, Loader } from 'components/system'

const Dependency = props => {
  const { blockId, name, version, uninstallDependency } = props
  const ref = useRef()
  const modalActions = useModalActions()
  const status = useDependencyStatus(blockId, name)

  return (
    <Flex
      ref={ref}
      sx={{
        color: 'textSecondary',
        padding: '5px 0px',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
      <span sx={{}}>
        {name} - {version}
      </span>
      {status && status.type !== 'complete' ? (
        <Loader />
      ) : (
        <IconButton
          type="trashcanOutline"
          onClick={async () => {
            const offset = ref.current.getBoundingClientRect()
            const result = await modalActions.openAt(modalIds.confirmation, {
              x: offset.right,
              y: offset.top,
            })
            if (result) {
              uninstallDependency(blockId, name)
            }
          }}
        />
      )}
    </Flex>
  )
}

const Dependencies = props => {
  const { blockId, packages, uninstallDependency } = props
  const modalActions = useModalActions()

  return (
    <div
      sx={{
        padding: [5],
        borderBottom: '2px solid',
        borderBottomColor: 'background',
      }}>
      <div>Dependencies</div>
      {Object.keys(packages).map(packageName => (
        <Dependency
          key={packageName}
          blockId={blockId}
          name={packageName}
          version={packages[packageName]}
          uninstallDependency={uninstallDependency}
        />
      ))}
      <div
        sx={{
          marginTop: '5px',
          textAlign: 'right',
        }}>
        <Button
          onClick={() => {
            modalActions.open(modalIds.dependencySearch)
          }}>
          <Flex
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Icon sx={{ width: '18px', height: '18px' }} type="plus" />
            <div sx={{ lineHeight: '14px', padding: '0px 5px' }}>Add</div>
          </Flex>
        </Button>
      </div>
    </div>
  )
}

export default Dependencies
