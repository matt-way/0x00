import algoliasearch from 'algoliasearch'

const algolia = algoliasearch(
  'OLSQ614C5E',
  '29c779373b994ec64f4f297a14b1a3b7',
  { protocol: 'https:' }
)
const index = algolia.initIndex('blocks')

const searchBlocks = (searchText, page = 0, hitsPerPage = 20) => {
  const options = {
    page,
    hitsPerPage,
    attributesToHighlight: [],
    attributesToRetrieve: ['name', 'description', 'tags', 'author', 'version'],
  }

  return index.search(searchText, options)
}

export { searchBlocks }
