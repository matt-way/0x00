import algoliasearch from 'algoliasearch'

const algolia = algoliasearch(
  'OFCNCOG2CU',
  'f54e21fa3a2a0160595bb058179bfb1e',
  { protocol: 'https:' }
)
const index = algolia.initIndex('npm-search')

const searchDependencies = (queryString, page = 0, hitsPerPage = 20) => {
  const options = {
    page,
    hitsPerPage,
    attributesToHighlight: [],
    attributesToRetrieve: [
      'deprecated',
      'description',
      'githubRepo',
      'homepage',
      'keywords',
      'license',
      'name',
      'owner',
      'version',
    ],
  }

  return index.search(queryString, options)
}

export { searchDependencies }
