/** @jsxImportSource theme-ui */
import { useModals } from 'state/modals/hooks'
import Intro from './intro'
import DependencySearch from './dependency-search'
import OnlineBlockSearch from './online-block-search'
import EditInputProperty from './edit-input-property'
import EditOutputProperty from './edit-output-property'
import Confirmation from './confirmation'
import EditBlockInformation from './edit-block-information'
import Auth from './auth'
import { modalIds } from 'state/modals/model'

const lookup = {
  [modalIds.intro]: Intro,
  [modalIds.dependencySearch]: DependencySearch,
  [modalIds.onlineBlockSearch]: OnlineBlockSearch,
  [modalIds.editInputProperty]: EditInputProperty,
  [modalIds.editOutputProperty]: EditOutputProperty,
  [modalIds.confirmation]: Confirmation,
  [modalIds.editBlockInformation]: EditBlockInformation,
  [modalIds.auth]: Auth,
}

const Modals = props => {
  const [modals, modalsActions] = useModals()

  if (!modals.openId) {
    return null
  }

  const Modal = lookup[modals.openId]
  return (
    <div
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Modal
        left={modals?.position?.x}
        top={modals?.position?.y}
        close={response => modalsActions.close(response)}
        {...modals.data}
      />
    </div>
  )
}

export default Modals
