import React, { useCallback } from 'react'

const ShadowRoot = props => {
  const { children, shadowRef, style } = props

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

  console.log({
    width: '100%',
    ...style,
  })

  return (
    <div
      style={{
        width: '100%',
        ...style,
      }}
      ref={attachShadow}>
      {children}
    </div>
  )
}

export default ShadowRoot
