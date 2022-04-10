import React, { useRef, useEffect } from 'react'
import ShadowRoot from './shadow-root'
import { attachBlockDom } from '../block-manager'

const Block = props => {
  const { id, error } = props
  const blockRef = useRef()

  useEffect(() => {
    attachBlockDom(id, blockRef.current)
  }, [])

  console.dir(Object.keys(error))

  return (
    <>
      {error && (
        <div
          style={{
            width: '100%',
            backgroundColor: 'red',
          }}>
          {error.stack}
        </div>
      )}
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
