import { useState, useEffect } from 'react'

const AnimatedText = ({ strings = [], delay = 250 }) => {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const timer = setTimeout(
      () => setIndex(index < strings.length - 1 ? index + 1 : 0),
      delay
    )
    return () => clearTimeout(timer)
  })

  return strings[index]
}

export default AnimatedText
