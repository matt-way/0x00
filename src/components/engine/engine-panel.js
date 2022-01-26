/** @jsxImportSource theme-ui */
import { useRef, useEffect } from 'react'
import { invoke } from 'ipc/renderer'

const EnginePanel = props => {
  const containerRef = useRef(null)

  const observer = useRef(
    new ResizeObserver(entries => {
      if (containerRef.current) {
        const { x, y, width, height } =
          containerRef.current.getBoundingClientRect()
        invoke.engine.setBounds({
          x: Math.round(x),
          y: Math.round(y),
          width: Math.round(width),
          height: Math.round(height),
        })
      }
    })
  )

  useEffect(() => {
    observer.current.observe(containerRef.current)
  }, [])

  return (
    <div
      ref={containerRef}
      sx={{
        height: 'calc(100% - 35px)',
        backgroundColor: 'white',
      }}
    />
  )
}

export default EnginePanel
