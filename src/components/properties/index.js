import Generic from './generic'
import Text from './text'
import Number from './number'
import Checkbox from './checkbox'
import Color from './color'
import Slider from './slider'
import FileSelector from './file-selector'

export const typeMap = {
  generic: {
    component: Generic,
    label: 'Generic Data',
  },
  text: {
    component: Text,
    label: 'Text',
  },
  slider: {
    component: Slider,
    label: 'Range Slider',
  },
  number: {
    component: Number,
    label: 'Number',
  },
  checkbox: {
    component: Checkbox,
    label: 'Checkbox',
  },
  color: {
    component: Color,
    label: 'Color Picker',
  },
  fileSelector: {
    component: FileSelector,
    label: 'File Selector',
  },
}
