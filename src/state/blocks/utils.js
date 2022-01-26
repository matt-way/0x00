import { values } from 'lodash'

const getAllowedName = (idealName = 'untitled', blocks) => {
  let name = idealName
  const takenNames = values(blocks).map(block => block.name.toLowerCase())
  for (var i = 1; takenNames.indexOf(name) >= 0; i++) {
    name = `${idealName}-${i}`
  }
  return name
}

const getDependencyId = (blockId, packageName) =>
  `block-${blockId}-dependency-${packageName}`

export { getAllowedName, getDependencyId }
