const crypto = require("crypto")
const axios = require('axios')
const _ = require('underscore')

class VisionectApiClient {
  constructor(apiServer, apiKey, apiSecret) {
    this.call = (method, path, data) => {
      const hmac = str => crypto.createHmac('sha256', apiSecret).update(str).digest("base64")
      const headers = {'Date': new Date().toUTCString(), 'Content-Type': 'application/json',}
      headers['Authorization'] = `${apiKey}:${hmac([method, '', headers['Content-Type'], headers['Date'], path].join('\n'))}`
      const promise = axios({method: method, url: apiServer + path, headers: headers, data: data})
      if (process.env.NODE_ENV === 'test') {
        console.assert(method === 'GET', 'Aborting non-GET API call in tests')
        return {method: method, path: path, promise: promise}
      }
      return promise.then(res => res.data)
    }
  }

  get = (path) => this.call('GET', path)
  post = (path, data) => this.call('POST', path, data)
  put = (path, data) => this.call('PUT', path, data)
  patch = (path, data) => this.call('PATCH', path, data)
  delete = (path, data) => this.call('DELETE', path, data)
  options = (path) => this.call('OPTIONS', path)

  #crud = (name) => Object.create({
    get: (id) => this.get(`/api/${name}/${id || ''}`),
    create: (id, data) => this.post(`/api/${name}/${id}`, data),
    update: (arg1, arg2) => arg2 ? this.put(`/api/${name}/${arg1}`, arg2) : this.put(`/api/${name}/`, arg1),
    delete: (id) => this.delete(`/api/${name}/${id}`),
  })

  #restart = (name, method) => (...uuids) => uuids.length === 1 ? this.post(`/api/${name}/${uuids[0]}/${method}`) : this.post(`/api/${name}/${method}`, uuids)

  devices = _.omit(Object.assign(this.#crud('device'), {
    config: (uuid, data) => data ? this.post(`/api/cmd/Param/${uuid}`, data) : this.get(`/api/devicetclv/${uuid}`),
    status: (uuid, from, to, group = true) => this.get(`api/devicestatus/${uuid}?from=${from}&to=${to}&group=${group}`),
    reboot: this.#restart('device', 'reboot'),
    view: (uuid) => Object.create({
      get: (cached = false, fileType = '.png') => this.get(`/api/live/device/${uuid}/${cached ? 'cached' : 'image'}${fileType}`),
      set: (img) => this.put(`/backend/${uuid}`, img)
    })
  }), 'create')

  sessions = Object.assign(this.#crud('session'), {
    restart: this.#restart('session', 'restart'),
    clearCache: (...uuids) => this.post('/api/session/webkit-clear-cache', uuids)
  })

  users = this.#crud('user')

  config = (data) => data ? this.put('/api/config/', data) : this.get('/api/config/')
  status = () => this.get('/api/status/')
}

module.exports = VisionectApiClient
