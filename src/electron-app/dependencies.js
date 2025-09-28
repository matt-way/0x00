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

const joinSep = (...args) => {
  return join(...args).replace(/\\/g, '/')
}

// register a special protocol for dynamically importing dependencies
export function initDependencyProtocolHandler() {
  const MODULES_FOLDER = '/node_modules/'

  protocol.handle('dep', async request => {
    const url = new URL(request.url)
    const blockId = url.hostname

    const { dependencies, path } = store.getState().blocks[blockId]

    const rawPackagePath = url.pathname.slice(2)
    const { packageName, packagePath } = parsePackageAndSubpath(rawPackagePath)

    if (!dependencies[packageName]) {
      return new Response(`Package not found: ${packageName}`, {
        status: 404,
      })
    }

    // handle asset loading
    if (packagePath && packagePath.endsWith('.wasm')) {
      // look for the file inside the block folder
      console.log('WASM')
      console.log(path)
    }

    const { contents, dependencyAliases } = dependencies[packageName]

    // if the provided path is exact, return the code, otherwise resolve with redirect
    console.log(packageName, packagePath)
    if (packagePath) {
      const codePath = joinSep(MODULES_FOLDER, packageName, packagePath)
      console.log(codePath)
      if (contents[codePath]) {
        const details = contents[codePath]
        let code = details.content
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
}
