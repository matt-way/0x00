/** @jsxImportSource theme-ui */
import Icon from './icon'
import { keyframes } from '@emotion/react'

const spin = keyframes`
50% {
  transform: rotate(180deg);
}
100% {
  transform: rotate(0deg);
}
`

const Loader = props => {
  return (
    <Icon
      type="timerSand"
      sx={{
        animation: `${spin} 2s infinite linear`,
      }}
      {...props}
    />
  )
}

export default Loader
