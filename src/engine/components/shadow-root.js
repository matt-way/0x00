import React, { useCallback } from 'react'

const ShadowRoot = props => {
  const { children, shadowRef } = props

  const attachShadow = useCallback(ref => {
    if (ref && !shadowRef.current) {
      const shadowRoot = ref.attachShadow({ mode: 'open' })
      //Move all children to shadowroot
      Array.from(ref.children).forEach(child => {
        shadowRoot.appendChild(child)
      })
      shadowRef.current = shadowRoot
    }
  })

  return (
    <div
      style={{
        width: '100%',
      }}
      ref={attachShadow}>
      {children}
    </div>
  )
}

export default ShadowRoot
