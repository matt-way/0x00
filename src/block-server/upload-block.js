import { getFunctions, httpsCallable } from 'firebase/functions'

const functions = getFunctions()
const fbUploadBlock = httpsCallable(functions, 'uploadBlock')

const uploadBlock = block => {
  const payload = {
    'package.json': {
      dependencies: {},
      ...block.config,
    },
    [block.config.main || 'code.js']: block.code,
  }
  return fbUploadBlock(payload).then(res => {
    const { data } = res
    if (data.error) {
      throw new Error(data.error)
    }
    return data
  })
}

export { uploadBlock }
