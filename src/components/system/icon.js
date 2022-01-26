/** @jsxImportSource theme-ui */
import LayersPlusIcon from 'mdi-react/LayersPlusIcon'
import LayersSearchIcon from 'mdi-react/LayersSearchIcon'
import LayersSearchOutlineIcon from 'mdi-react/LayersSearchOutlineIcon'
import LibraryPlusIcon from 'mdi-react/LibraryPlusIcon'
import MagnifyIcon from 'mdi-react/MagnifyIcon'
import CloseIcon from 'mdi-react/CloseIcon'
import ChevronDownIcon from 'mdi-react/ChevronDownIcon'
import SquareEditOutlineIcon from 'mdi-react/SquareEditOutlineIcon'
import PlusIcon from 'mdi-react/PlusIcon'
import PlusBoxOutlineIcon from 'mdi-react/PlusBoxOutlineIcon'
import TimerSandIcon from 'mdi-react/TimerSandIcon'
import DockWindowIcon from 'mdi-react/DockWindowIcon'
import DockRightIcon from 'mdi-react/DockRightIcon'
import PlayIcon from 'mdi-react/PlayIcon'
import PauseIcon from 'mdi-react/PauseIcon'
import TrashcanOutlineIcon from 'mdi-react/TrashcanOutlineIcon'
import UploadNetworkOutline from 'mdi-react/UploadNetworkOutlineIcon'
import CloudUploadOutline from 'mdi-react/CloudUploadOutlineIcon'
import LockAlertOutline from 'mdi-react/LockAlertOutlineIcon'

const map = {
  layersPlus: LayersPlusIcon,
  layersSearch: LayersSearchIcon,
  libraryPlus: LibraryPlusIcon,
  layersSearchOutline: LayersSearchOutlineIcon,
  magnify: MagnifyIcon,
  close: CloseIcon,
  chevronDown: ChevronDownIcon,
  squareEditOutline: SquareEditOutlineIcon,
  plus: PlusIcon,
  plusBoxOutline: PlusBoxOutlineIcon,
  timerSand: TimerSandIcon,
  dockWindow: DockWindowIcon,
  dockRight: DockRightIcon,
  play: PlayIcon,
  pause: PauseIcon,
  trashcanOutline: TrashcanOutlineIcon,
  uploadNetworkOutline: UploadNetworkOutline,
  cloudUploadOutline: CloudUploadOutline,
  lockAlertOutline: LockAlertOutline,
}

const Icon = props => {
  const { type, ...rest } = props
  const TheIcon = map[type]
  return (
    <TheIcon
      sx={{ width: '18px', height: '18px', verticalAlign: 'middle' }}
      {...rest}
    />
  )
}

export default Icon
