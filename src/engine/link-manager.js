const outgoingLinks = {}
const incomingLinks = {}

function addUpdateLink(
  sourceBlockId,
  sourcePropId,
  targetBlockId,
  targetPropId,
  activated
) {
  if (!outgoingLinks[sourceBlockId]) {
    outgoingLinks[sourceBlockId] = {}
  }
  if (!outgoingLinks[sourceBlockId][sourcePropId]) {
    outgoingLinks[sourceBlockId][sourcePropId] = []
  }
  outgoingLinks[sourceBlockId][sourcePropId].push({
    targetBlockId,
    targetPropId,
    activated,
  })

  if (!incomingLinks[targetBlockId]) {
    incomingLinks[targetBlockId] = {}
  }
  incomingLinks[targetBlockId][targetPropId] = {
    sourceBlockId,
    sourcePropId,
    activated,
  }
}

function removeLink(sourceBlockId, sourcePropId, targetBlockId, targetPropId) {
  if (incomingLinks[targetBlockId]) {
    delete incomingLinks[targetBlockId][targetPropId]
  }
  if (outgoingLinks[sourceBlockId]) {
    const outgoingSet = outgoingLinks[sourceBlockId][sourcePropId]
    const linkIndex = outgoingSet.findIndex(
      link =>
        link.targetBlockId === targetBlockId &&
        link.targetPropId === targetPropId
    )
    outgoingSet.splice(linkIndex, 1)
  }
}

function removeAllLinks(blockId) {
  delete incomingLinks[blockId]
  delete outgoingLinks[blockId]
  Object.keys(outgoingLinks).forEach(id => {
    const outBlock = outgoingLinks[id]
    Object.keys(outBlock).forEach(propId => {
      const outLinks = outBlock[propId]
      outBlock[propId] = outLinks.filter(l => l.targetBlockId !== blockId)
    })
  })
}

function getOutgoingLinks(blockId, propId) {
  return outgoingLinks?.[blockId]?.[propId] || []
}

function getIncomingLinks(blockId) {
  return incomingLinks?.[blockId] || {}
}

function activateLink(
  sourceBlockId,
  sourcePropId,
  targetBlockId,
  targetPropId
) {
  outgoingLinks[sourceBlockId][sourcePropId].activated = true
  incomingLinks[targetBlockId][targetPropId].activated = true
}

function logLinkGraph() {
  console.log(outgoingLinks)
  console.log(incomingLinks)
}

export {
  addUpdateLink,
  removeLink,
  removeAllLinks,
  getOutgoingLinks,
  getIncomingLinks,
  activateLink,
  logLinkGraph,
}
