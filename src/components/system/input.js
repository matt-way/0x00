/** @jsxImportSource theme-ui */
import { useEffect, useRef } from 'react'
import { debounce } from 'lodash'

const Input = props => {
  const {
    focusOnMount,
    children,
    onChange,
    onChangeDebounce,
    debounceTime = 500,
    ...rest
  } = props
  const inputRef = useRef()

  useEffect(() => {
    if (focusOnMount) {
      inputRef.current.focus()
    }
  }, [])

  const debounceChange =
    onChangeDebounce && debounce(onChangeDebounce, debounceTime)

  return (
    <input
      sx={{
        backgroundColor: 'inputBackground',
        border: 'none',
        outline: 'none',
        borderRadius: '3px',
        color: 'textSecondary',
        textAlign: 'center',
        padding: '3px 3px',
        width: '100%',
      }}
      onChange={(...args) => {
        if (onChange) {
          onChange(...args)
        }
        if (onChangeDebounce) {
          debounceChange(...args)
        }
      }}
      ref={inputRef}
      {...rest}
    />
  )
}

export default Input
