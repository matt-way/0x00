import React, { createContext, useState, useContext } from 'react'

const HubPositionContext = createContext({})

export const HubPositionProvider = (props) => {
  const { children } = props
  const [positions, setPositions] = useState({})

  function setPosition(key, position) {
    setPositions((oldPositions) => {
      if (position) {
        return {
          ...oldPositions,
          [key]: position,
        }
      } else {
        const { [key]: toRemove, ...rest } = oldPositions
        return rest
      }
    })
  }

  return (
    <HubPositionContext.Provider value={[positions, setPosition]}>
      {children}
    </HubPositionContext.Provider>
  )
}

export const useSetHubPosition = () => {
  const [_, setHubPosition] = useContext(HubPositionContext)
  return setHubPosition
}

export const useHubPositions = () => {
  const [positions] = useContext(HubPositionContext)
  return positions
}
