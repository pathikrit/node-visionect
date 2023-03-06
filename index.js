const crypto = require("crypto")
const axios = require('axios')
const _ = require('lodash')

class VisionectApiClient {
  constructor(config) {
    const hmac = str => crypto.createHmac('sha256', config.apiSecret).update(str).digest("base64")
    this.http = axios.create({baseURL: config.apiServer, headers: {'Content-Type': 'application/json'}})
    this.http.interceptors.request.use(req => {
      req.headers['Date'] = new Date().toUTCString()
      const hashThis = [req.method.toUpperCase(), '', req.headers['Content-Type'], req.headers['Date'], req.url]
      req.headers['Authorization'] = `${config.apiKey}:${hmac(hashThis.join('\n'))}`
      return req
    })
  }
  
  post = (path, data) => this.call('POST', path, data)
  put = (path, data) => this.call('PUT', path, data)
  patch = (path, data) => this.call('PATCH', path, data)
  delete = (path, data) => this.call('DELETE', path, data)
  options = (path) => this.call('OPTIONS', path)

  #crud = (name) => {
    const get = (id) => this.http.get(`/api/${name}/${id || ''}`)
    const create = (id, data) => this.post(`/api/${name}/${id}`, data)
    const update = (arg1, arg2) => arg2 ? this.put(`/api/${name}/${arg1}`, arg2) : this.put(`/api/${name}/`, arg1)
    const delte = (id) => this.delete(`/api/${name}/${id}`)
    const patch = (id, data) => get(id).then(res => update(id, _.merge(res.data, data)))
    return {get: get, create: create, update: update, delete: delte, patch: patch}
  }

  #restart = (name, method) => (...uuids) => uuids.length === 1 ? this.post(`/api/${name}/${uuids[0]}/${method}`) : this.post(`/api/${name}/${method}`, uuids)

  devices = _.omit(Object.assign(this.#crud('device'), {
    config: (uuid, data) => data ? this.post(`/api/cmd/Param/${uuid}`, data) : this.http.get(`/api/devicetclv/${uuid}`),
    status: (uuid, from, to, group = true) => this.http.get(`api/devicestatus/${uuid}?from=${from}&to=${to}&group=${group}`),
    reboot: this.#restart('device', 'reboot'),
    view: (uuid) => Object.create({
      get: (cached = false, fileType = '.png') => this.http.get(`/api/live/device/${uuid}/${cached ? 'cached' : 'image'}${fileType}`),
      set: (img) => this.put(`/backend/${uuid}`, img)
    })
  }), 'create')

  sessions = Object.assign(this.#crud('session'), {
    restart: this.#restart('session', 'restart'),
    clearCache: (...uuids) => this.post('/api/session/webkit-clear-cache', uuids)
  })

  users = this.#crud('user')

  config = (data) => data ? this.put('/api/config/', data) : this.http.get('/api/config/')
  status = () => this.http.get('/api/status/')
  orphans = (all = true) => this.http.get(`/api/orphans?all=${all}`)
}

module.exports = VisionectApiClient
