/** @jsxImportSource theme-ui */
import { Flex, Icon, DropDown, DropDownItem } from 'components/system'
import { useModalActions } from 'state/modals/hooks'
import { modalIds } from 'state/modals/model'
import { invoke } from 'ipc/renderer'

const Toolbar = props => {
  const modalActions = useModalActions()

  return (
    <div
      sx={{
        backgroundColor: 'surface',
        borderBottomWidth: '2px',
        borderBottomStyle: 'solid',
        borderBottomColor: 'surfaceLowest',
        borderRadius: '5px 5px 0px 0px',
        fontSize: '12px',
      }}>
      <DropDown
        buttonStyles={{
          borderRadius: '5px 0px 0px 0px',
          padding: '4px 12px',
        }}
        buttonContent={
          <Flex
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Icon sx={{ width: '18px', height: '18px' }} type="layersPlus" />
            <div sx={{ padding: '0px 5px' }}>Add Block</div>
            <Icon sx={{ width: '18px', height: '18px' }} type="chevronDown" />
          </Flex>
        }>
        <DropDownItem onClick={() => invoke.blocks.create()}>
          Add new empty block
        </DropDownItem>
        <DropDownItem
          onClick={() => modalActions.open(modalIds.onlineBlockSearch)}>
          Search for block online
        </DropDownItem>
        <DropDownItem onClick={() => invoke.blocks.createFromExisting()}>
          Add block from file
        </DropDownItem>
      </DropDown>
    </div>
  )
}

export default Toolbar
