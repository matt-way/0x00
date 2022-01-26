/** @jsxImportSource theme-ui */
import React, { useState } from 'react'
import { useClickOutside } from 'utils/hooks'
import ToolbarButton from './toolbar-button'
import Button from './button'

const zIndex = 9999

const DropDown = props => {
  const { className, children, buttonStyles, buttonContent } = props
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div
      sx={{
        position: 'relative',
        display: 'inline-block',
        verticalAlign: 'top',
      }}
      className={className}>
      <ToolbarButton
        sx={{
          display: 'block',
          ...buttonStyles,
        }}
        onClick={() => {
          setShowMenu(true)
        }}>
        {buttonContent}
      </ToolbarButton>
      {showMenu && (
        <DropDownMenu hideMenu={() => setShowMenu(false)}>
          {React.Children.map(children, child =>
            React.cloneElement(child, { onClose: () => setShowMenu(false) })
          )}
        </DropDownMenu>
      )}
    </div>
  )
}

const DropDownMenu = props => {
  const { children, hideMenu } = props
  const ref = useClickOutside(e => {
    e.stopPropagation()
    hideMenu()
  })
  return (
    <div
      sx={{
        position: 'absolute',
        left: 0,
        top: '105%',
        backgroundColor: 'surface',
        zIndex: 99999,
        fontSize: 12,
        whiteSpace: 'nowrap',
        padding: '5px 0px',
      }}
      ref={ref}>
      {children}
    </div>
  )
}

const DropDownItem = props => {
  const { onClick, onClose, ...rest } = props
  return (
    <Button
      sx={{
        borderBottom: 'none',
        display: 'block',
        width: '100%',
        padding: '6px 12px',
        fontSize: 12,
        textAlign: 'left',
      }}
      onClick={e => {
        onClose()
        onClick(e)
      }}
      {...rest}
    />
  )
}

export { DropDown, DropDownItem }
