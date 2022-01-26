import fetch from 'electron-fetch'

const downloadBlock = (name, version) => {
  const url = `https://firebasestorage.googleapis.com/v0/b/x15-9e8ff.appspot.com/o/blocks%2F${name}%2F${version}.json?alt=media`
  return fetch(url).then(res => res.json())
}

export { downloadBlock }
