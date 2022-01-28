/**
 * This piggybacks off of sandpack core. We utilise the dependency data returned,
 * but use our own runtime.
 */
import fetch from 'electron-fetch'
import { app } from 'electron'
import { delay } from 'utils/promise'
import { join } from './disk/path'
import { existsSync, readFileSync, writeFileSync, ensureDir } from './disk/fs'
import { transform } from '@babel/core'
import importExport from '@babel/plugin-transform-modules-commonjs'

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
    console.error({ err })

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

  try {
    const bucketManifest = await callApi(fullUrl)
    return bucketManifest
  } catch (e) {
    const packagerRequestUrl = encodeURIComponent(
      `${PACKAGER_URL}/${depName}@${version}`
    )
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
    const packageJson = JSON.parse(
      (dep.contents[`/node_modules/${depName}/package.json`] || {}).content
    )
    if (packageJson && (packageJson.module || packageJson.type === 'module')) {
      Object.keys(dep.contents)
        .filter(file => file.endsWith('.js'))
        .forEach(file => {
          dep.contents[file].content = transform(dep.contents[file].content, {
            plugins: [importExport],
          }).code
        })
    }

    await setCache(depName, version, dep)
  }

  return dep
}
