/**
 * This piggybacks off of sandpack core. We utilise the dependency data returned,
 * but use our own runtime.
 */

import { app, protocol } from 'electron'
import { ensureDir, existsSync, readFileSync, writeFileSync } from './disk/fs'

import { delay } from 'utils/promise'
import fetch from 'electron-fetch'
import importExport from '@babel/plugin-transform-modules-commonjs'
import { join } from './disk/path'
import store from './store'
import { transform } from '@babel/core'

const VERSION = 2
const RETRY_COUNT = 3
const MAX_RETRY_DELAY = 5000

// eslint-disable-next-line
const PROD_URLS = {
  packager:
    'https://aiwi8rnkp5.execute-api.eu-west-1.amazonaws.com/prod/packages',
  bucket: 'https://prod-packager-packages.codesandbox.io',
}

const URLS = PROD_URLS
const BUCKET_URL = URLS.bucket
const PACKAGER_URL = URLS.packager

function callApi(url, method = 'GET') {
  return fetch(url, {
    method,
  })
    .then(async response => {
      if (!response.ok) {
        const error = new Error(response.statusText || '' + response.status)

        try {
          error.response = await response.text()
        } catch (err) {
          console.error(err)
        }

        error.statusCode = response.status
        throw error
      }

      return response
    })
    .then(response => response.json())
}

/**
 * Request the packager, if retries > RETRY_COUNT it will throw if something goes wrong
 * otherwise it will retry again with an incremented retry
 *
 * @param {string} query The dependencies to call
 */
async function requestPackager(url, method = 'GET', retries = 0) {
  try {
    const manifest = await callApi(url, method)
    return manifest
  } catch (err) {
    console.error({ err, url, method })

    // If it's a 403 or network error, we retry the fetch
    if (err.response && err.statusCode !== 403) {
      throw new Error(err.response.error)
    }

    // 403 status code means the bundler is still bundling
    if (retries < RETRY_COUNT) {
      const msDelay = Math.min(
        MAX_RETRY_DELAY,
        1000 * retries + Math.round(Math.random() * 1000)
      )
      console.warn(`Retrying package fetch in ${msDelay}ms`)
      await delay(msDelay)
      return requestPackager(url, method, retries + 1)
    }

    throw err
  }
}

async function getDependency(depName, version) {
  // for now we will only work with absolute versions that are correct semvers
  const fullUrl = `${BUCKET_URL}/v${VERSION}/packages/${depName}/${version}.json`
  console.log(fullUrl)
  try {
    const bucketManifest = await callApi(fullUrl)
    return bucketManifest
  } catch (e) {
    const packagerRequestUrl = `${PACKAGER_URL}/${depName}@${version}`
    await requestPackager(packagerRequestUrl, 'POST')

    return requestPackager(fullUrl)
  }
}

const requestCache = async (depName, version) => {
  const path = join(
    app.getPath('appData'),
    `packages/${depName}/${version}.json`
  )
  // check if path exists
  if (existsSync(path)) {
    return JSON.parse(readFileSync(path, 'utf8'))
  }
}

const setCache = async (depName, version, manifest) => {
  const folder = join(app.getPath('appData'), '0x00', 'packages', depName)
  await ensureDir(folder)

  const path = join(
    app.getPath('appData'),
    `0x00/packages/${depName}/${version}.json`
  )
  console.log(`Writing cache to ${path}`)
  writeFileSync(path, JSON.stringify(manifest))
}

export const installDependency = async (depName, version) => {
  // attempt to get the dependency json from the local cache
  let dep = await requestCache(depName, version)

  if (!dep) {
    dep = await getDependency(depName, version)

    // if an es module is found, then we try transpile it back to commonjs to work with electron limitations
    /*const packageJson = JSON.parse(
      (dep.contents[`/node_modules/${depName}/package.json`] || {}).content
    )
    // for now lets just transpile everything for import/export
    // TODO: be smarter about which files to transpile, looking through all package.json files
    if (packageJson && (packageJson.module || packageJson.type === 'module')) {
      Object.keys(dep.contents)
        .filter(file => file.endsWith('.js') || file.endsWith('.mjs'))
        .forEach(file => {
          dep.contents[file].content = transform(dep.contents[file].content, {
            plugins: [importExport],
          }).code
        })
    }*/

    await setCache(depName, version, dep)
  }

  return dep
}

export function initDependencyProtocolHandler() {
  protocol.handle('dep', async request => {
    const url = new URL(request.url)

    // Expect dep://<host>/<path>?<query>
    const upstream = `https://${url.hostname}${url.pathname}${url.search}`

    const res = await fetch(upstream)

    return new Response(res.body, {
      status: res.status,
      headers: {
        // Preserve content type; default to JS if missing
        'Content-Type': res.headers.get('content-type') || 'text/javascript',
      },
    })
  })
}

/*
function flattenDependencyContents(dependencies) {
  // Returns a flat { [absolutePath]: fileRecord } map across ALL dependencies.
  // Later wins on collisions (deterministic by iteration order).
  const vfs = Object.create(null)

  if (!dependencies) return vfs

  for (const depName of Object.keys(dependencies)) {
    const dep = dependencies[depName]
    const contents = dep && dep.contents
    if (!contents) continue

    for (const p of Object.keys(contents)) {
      // Keep paths exactly as stored (your resolver expects absolute "/node_modules/..." keys).
      vfs[p] = contents[p]
    }
  }

  return vfs
}

function parsePackageNameAndSubpath(rawPath) {
  let packageName, packagePath

  if (rawPath.startsWith('@')) {
    // Scoped package
    const parts = rawPath.split('/')
    packageName = `${parts[0]}/${parts[1]}`
    packagePath = parts.slice(2).join('/') || null
  } else {
    const parts = rawPath.split('/')
    packageName = parts[0]
    packagePath = parts.slice(1).join('/') || null
  }

  return { packageName, packagePath }
}

let doneOne = false

export function initDependencyProtocolHandler() {
  const MODULES_FOLDER = '/node_modules/'

  protocol.handle('dep', async request => {
    const url = new URL(request.url)

    const blockId = url.hostname
    const block = store.getState().blocks[blockId]
    if (!block) {
      return new Response(`Unknown block: ${blockId}`, { status: 404 })
    }

    const { dependencies } = block
    const rawPackagePath = url.pathname.slice(2)

    console.log('rpp:', request.url)

    const vfs = flattenDependencyContents(dependencies)

    if (!vfs[rawPackagePath]) {
      const suffixes = ['.js', '.mjs', '.cjs', '/index.js']

      for (const s of suffixes) {
        const altered = rawPackagePath + s
        if (vfs[altered]) {
          return new Response(null, {
            status: 302,
            headers: { Location: `dep://${blockId}//${altered}` },
          })
        }
      }
    }

    // handle json if found
    if (vfs[rawPackagePath] && rawPackagePath.endsWith('.json')) {
      const jsonText = vfs[rawPackagePath].content
      // Don’t parse/stringify if you don’t need to; but parsing lets you validate.
      let obj
      try {
        obj = JSON.parse(jsonText)
      } catch {
        obj = null
      }

      if (!obj)
        return new Response(`Invalid JSON: ${rawPackagePath}`, { status: 500 })

      const code =
        `export default ${JSON.stringify(obj)};\n` +
        // optional convenience for common fields AWS imports
        (obj.version
          ? `export const version = ${JSON.stringify(obj.version)};\n`
          : '')

      return new Response(code, {
        headers: { 'Content-Type': 'text/javascript' },
      })
    }

    if (vfs[rawPackagePath]) {
      const file = vfs[rawPackagePath]
      let code = file.content

      if (file.isModule === false) {
        code = wrapCjsAsEsm(code)
      } else {
        code = transpileBareImports(code, blockId)
      }

      return new Response(code, {
        headers: { 'Content-Type': 'text/javascript' },
      })
    }

    // Try and resolve a package.json
    const { packageName, subpath } = parsePackageNameAndSubpath(rawPackagePath)
    const packageJsonPath = `${MODULES_FOLDER}${packageName}/package.json`

    const pkgJsonFile = vfs[packageJsonPath]
    if (pkgJsonFile) {
      let pkgJson
      try {
        pkgJson = JSON.parse(pkgJsonFile.content)

        const candidates = candidatePathsFromPackageJson(
          MODULES_FOLDER,
          packageName,
          subpath,
          pkgJson
        )

        console.log(candidates)

        for (const candidatePath of candidates) {
          if (vfs[candidatePath]) {
            return new Response(null, {
              status: 302,
              headers: { Location: `dep://${blockId}//${candidatePath}` },
            })
          }
        }
      } catch (err) {
        // ignore parse errors and fall through
        console.log('package parse error:', err)
      }
    }

    if (!doneOne) {
      console.log('404ing:', rawPackagePath)
      console.log(Object.keys(vfs))
      doneOne = true
    }
    return new Response(`dep:// resolution failed for ${rawPackagePath}`, {
      status: 404,
    })
  })
}

function candidatePathsFromPackageJson(
  MODULES_FOLDER,
  packageName,
  packagePath,
  packageJson
) {
  const base = `${MODULES_FOLDER}${packageName}`

  const candidateRel = []

  if (!packagePath) {
    // Root import: "pkg"
    if (packageJson.exports) {
      const target = packageJson.exports['.'] || packageJson.exports
      pushExportTarget(candidateRel, target)
    }

    if (packageJson.browser && typeof packageJson.browser === 'string') {
      candidateRel.push(packageJson.browser)
    }
    if (packageJson.module) candidateRel.push(packageJson.module)
    if (packageJson.main) candidateRel.push(packageJson.main)

    candidateRel.push('index.js')
  } else {
    // Subpath import: "pkg/<packagePath>"
    const key = `./${packagePath}`
    if (packageJson.exports && packageJson.exports[key]) {
      const target = packageJson.exports[key]
      pushExportTarget(candidateRel, target)
    } else {
      candidateRel.push(packagePath)
    }
  }

  // Expand and absolutize
  const out = []
  for (const rel0 of candidateRel) {
    if (!rel0 || typeof rel0 !== 'string') continue

    const rel = stripDotSlash(rel0)

    const toTry = [rel]
    if (rel.endsWith('/')) {
      toTry.push(rel + 'index.js')
    } else if (!rel.endsWith('.js')) {
      toTry.push(rel + '.js')
      toTry.push(rel + '/index.js')
    }

    for (const t of toTry) {
      out.push(`${base}/${stripLeadingSlash(t)}`)
    }
  }

  return out
}

function pushExportTarget(arr, target) {
  if (!target) return
  if (typeof target === 'string') {
    arr.push(target)
    return
  }
  if (typeof target === 'object') {
    if (typeof target.import === 'string') arr.push(target.import)
    else if (typeof target.default === 'string') arr.push(target.default)
  }
}

function wrapCjsAsEsm(cjsCode) {
  return `
const module = { exports: {} };
const exports = module.exports;

(function (module, exports) {
${cjsCode}
})(module, exports);

export default module.exports;
`.trim()
}

function stripDotSlash(p) {
  return p.startsWith('./') ? p.slice(2) : p
}

function stripLeadingSlash(p) {
  return p.startsWith('/') ? p.slice(1) : p
}

function transpileBareImports(code, blockId) {
  const isBare = s =>
    !/^(?:\.{1,2}\/|\/|dep:|node:|https?:|data:|file:)/.test(s)

  const toDep = s => (isBare(s) ? `dep://${blockId}//${s}` : s)

  // import ... from "x"  | export ... from "x"
  code = code.replace(
    /\b(import|export)\s+([^'"]*?\s+from\s+)?(["'])([^"']+)\3/g,
    (m, kw, fromPart, q, spec) =>
      `${kw} ${fromPart || ''}${q}${toDep(spec)}${q}`
  )

  // side-effect import "x"
  code = code.replace(
    /\bimport\s+(["'])([^"']+)\1/g,
    (m, q, spec) => `import ${q}${toDep(spec)}${q}`
  )

  // dynamic import("x")
  code = code.replace(
    /\bimport\s*\(\s*(["'])([^"']+)\1\s*\)/g,
    (m, q, spec) => `import(${q}${toDep(spec)}${q})`
  )

  // require("x") (useful for CJS packages)
  code = code.replace(
    /\brequire\s*\(\s*(["'])([^"']+)\1\s*\)/g,
    (m, q, spec) => `require(${q}${toDep(spec)}${q})`
  )

  return code
}

/*
function parsePackageAndSubpath(rawPath) {
  let packageName, packagePath

  if (rawPath.startsWith('@')) {
    // Scoped package
    const parts = rawPath.split('/')
    packageName = `${parts[0]}/${parts[1]}`
    packagePath = parts.slice(2).join('/') || null
  } else {
    const parts = rawPath.split('/')
    packageName = parts[0]
    packagePath = parts.slice(1).join('/') || null
  }

  return { packageName, packagePath }
}

function transpileBareImports(code, blockId) {
  return code.replace(
    /from\s+(['"])([^.'"/][^'"]*)\1/g,
    (match, quote, specifier) =>
      `from ${quote}dep://${blockId}//${specifier}${quote}`
  )
}

const joinSep = (...args) => {
  return join(...args).replace(/\\/g, '/')
}

// register a special protocol for dynamically importing dependencies
export function initDependencyProtocolHandler() {
  const MODULES_FOLDER = '/node_modules/'

  protocol.handle('dep', async request => {
    const url = new URL(request.url)

    if (url.pathname.includes('package.json')) {
      console.log('=== REQUEST FOR PACKAGE.JSON ===')
      console.log('Full URL:', request.url)
      console.log('Pathname:', url.pathname)
      console.log('Referrer:', request.referrer) // This shows which file imported it
    }

    const blockId = url.hostname

    const { dependencies, path } = store.getState().blocks[blockId]

    const rawPackagePath = url.pathname.slice(2)
    const { packageName, packagePath } = parsePackageAndSubpath(rawPackagePath)

    // Try top-level first
    let targetDependency = dependencies[packageName]
    let contents

    // If not found at top level, aggregate from all nested dependencies
    if (!targetDependency) {
      const aggregatedContents = {}

      for (const [parentName, parentDep] of Object.entries(dependencies)) {
        // Find all files belonging to this package across all parents
        for (const [path, fileData] of Object.entries(parentDep.contents)) {
          if (path.includes(`/node_modules/${packageName}/`)) {
            aggregatedContents[path] = fileData
          }
        }
      }

      if (Object.keys(aggregatedContents).length === 0) {
        return new Response(`Package not found: ${packageName}`, {
          status: 404,
        })
      }

      // Create a virtual dependency with aggregated contents
      contents = aggregatedContents
      targetDependency = { contents: aggregatedContents }
    } else {
      contents = targetDependency.contents
    }

    const dependencyAliases = targetDependency.dependencyAliases || {}

    // if the provided path is exact, return the code, otherwise resolve with redirect
    console.log(packageName, packagePath)
    if (packagePath) {
      const codePath = joinSep(MODULES_FOLDER, packageName, packagePath)
      console.log(codePath)
      if (contents[codePath]) {
        const details = contents[codePath]
        let code = details.content

        // Transpile bare imports to relative paths
        code = transpileBareImports(code, blockId)

        if (details.isModule === false) {
          code = `
const exports = {};
const module = { exports };
(function(module, exports) {
  ${details.content}
})(module, exports);
export default module.exports;
  `
        }
        //console.log(code.slice(0, 300))
        return new Response(code, {
          headers: { 'content-type': 'application/javascript' },
        })
      }
    }

    const packageJsonPath = `${MODULES_FOLDER}${packageName}/package.json`
    const packageJson = JSON.parse(contents[packageJsonPath].content)

    // if no path given, we need to figure out the entry point using the package json
    const candidatePaths = []
    if (!packagePath) {
      if (packageJson.exports) {
        const target = packageJson.exports['.'] || packageJson.exports
        if (typeof target === 'string') {
          candidatePaths.push(target)
        } else if (target.import || target.default) {
          candidatePaths.push(target.import || target.default)
        }
      }
      if (packageJson.browser && typeof packageJson.browser === 'string') {
        candidatePaths.push(packageJson.browser)
      }
      if (packageJson.module) candidatePaths.push(packageJson.module)
      if (packageJson.main) candidatePaths.push(packageJson.main)
      candidatePaths.push('index.js')
    } else {
      // try and directly load relative path
      const key = `./${packagePath}`
      if (packageJson.exports && packageJson.exports[key]) {
        const target = packageJson.exports[key]
        if (typeof target === 'string') {
          candidatePaths.push(target)
        } else if (target.import || target.default) {
          candidatePaths.push(target.import || target.default)
        }
      } else {
        candidatePaths.push(packagePath)
      }
    }

    for (const candidate of candidatePaths) {
      const toTry = [candidate]
      if (candidate.endsWith('/')) {
        toTry.push(candidate + 'index.js')
      } else if (!candidate.endsWith('.js')) {
        toTry.push(candidate + '.js')
        toTry.push(candidate + '/index.js')
      }

      const match = toTry.find(
        p => contents[joinSep(MODULES_FOLDER, packageName, p)]
      )
      if (match) {
        return new Response(null, {
          status: 302,
          headers: { Location: `dep://${blockId}//${packageName}/${match}` },
        })
      }
    }

    return new Response(
      `Package (${packageName}) path not found: ${packagePath}`,
      {
        status: 404,
      }
    )
  })
}*/
