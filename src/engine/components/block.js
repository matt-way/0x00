import React, { useRef, useEffect } from 'react'
import ShadowRoot from './shadow-root'
import Error from './error'
import { attachBlockDom } from '../block-manager'

const Block = props => {
  const { id, error } = props
  const blockRef = useRef()

  useEffect(() => {
    attachBlockDom(id, blockRef.current)
  }, [])

  return (
    <>
      {error && <Error error={error} />}
      <ShadowRoot
        shadowRef={blockRef}
        style={{ display: error ? 'none' : 'block' }}>
        <div id={`${id}-head`} />
        <div id={`${id}-content`} />
      </ShadowRoot>
    </>
  )
}

export default Block
