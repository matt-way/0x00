import { useState, useEffect, useRef, useCallback, useReducer } from 'react'

export const useRafRerender = () => {
  const rendering = useRef(false)
  const [, forceUpdate] = useReducer(x => x + 1, 0)

  const render = useCallback(() => {
    forceUpdate()
    rendering.current = false
  }, [])

  return () => {
    if (!rendering.current) {
      rendering.current = true
      requestAnimationFrame(render)
    }
  }
}

export const useEffectNoInitial = (fn, deps) => {
  const isMounted = useRef(false)

  useEffect(() => {
    if (isMounted.current) {
      return fn()
    }
  }, deps)

  useEffect(() => {
    isMounted.current = true
  }, [])
}

export const useClickOutside = onClick => {
  const ref = useRef(null)

  const handleClickOutside = event => {
    if (ref.current && !ref.current.contains(event.target)) {
      onClick(event)
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  })

  return ref
}
