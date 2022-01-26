import querystring from 'querystring'

const NPM_REGISTRY_URL = 'https://registry.npmjs.org'
const BLOCK_KEYWORD = 'pq3t48npq034aa'

const isGitURL = url => {
  const r = new RegExp(
    '((git|ssh|http(s)?)|(git@[w.-]+))(:(//)?)([w.@:/~-]+)(.git)(/)?',
    'g'
  )
  return r.test(url)
}

const searchPackages = (text, prefix) => {
  const q = querystring.stringify({ text: prefix ? `${prefix} ${text}` : text })
  return `${NPM_REGISTRY_URL}/-/v1/search?${q}`
}

export { isGitURL, searchPackages, BLOCK_KEYWORD }
