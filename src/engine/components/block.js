import React, { useRef, useEffect } from 'react'
import ShadowRoot from './shadow-root'
import { attachBlockDom } from '../block-manager'

const Block = props => {
  const { id } = props
  const blockRef = useRef()

  useEffect(() => {
    attachBlockDom(id, blockRef.current)
  }, [])

  return (
    <ShadowRoot shadowRef={blockRef}>
      <div id={`${id}-head`} />
      <div id={`${id}-content`} />
    </ShadowRoot>
  )
}

export default Block
