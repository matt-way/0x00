import ipcConstants from './constants'

const typeProxies = {}
Object.keys(ipcConstants).forEach(type => {
  typeProxies[type] = new Proxy(ipcConstants[type], {
    get: function (target, channel) {
      if (!target[channel]) {
        throw new Error(`Invalid ipc channel called: ${channel}`)
      }

      return window.ipcInvoke[ipcConstants[type][channel]]
    },
  })
})

const invoke = new Proxy(typeProxies, {
  get: function (target, type) {
    if (!window.ipcInvoke) {
      throw new Error('ipc bridge missing')
    }

    if (!target[type]) {
      throw new Error(`Invalid ipc type used: ${type}`)
    }

    return target[type]
  },
})

export { invoke }
