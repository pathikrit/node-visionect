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

  #crud = (name) => {
    const get = (id) => this.http.get(`/api/${name}/${id || ''}`)
    const create = (id, data) => this.http.post(`/api/${name}/${id}`, data)
    const update = (arg1, arg2) => arg2 ? this.http.put(`/api/${name}/${arg1}`, arg2) : this.http.put(`/api/${name}/`, arg1)
    const delte = (id) => this.http.delete(`/api/${name}/${id}`)
    const patch = (id, data) => get(id).then(res => update(id, _.merge(res.data, data)))
    return {get: get, create: create, update: update, delete: delte, patch: patch}
  }

  #restart = (name, method) => (...uuids) => uuids.length === 1 ? this.http.post(`/api/${name}/${uuids[0]}/${method}`) : this.http.post(`/api/${name}/${method}`, uuids)

  devices = _.omit(Object.assign(this.#crud('device'), {
    config: (uuid, data) => data ? this.http.post(`/api/cmd/Param/${uuid}`, data) : this.http.get(`/api/devicetclv/${uuid}`),
    status: (uuid, from, to, group = true) => this.http.get(`api/devicestatus/${uuid}?from=${from}&to=${to}&group=${group}`),
    reboot: this.#restart('device', 'reboot'),
    view: (uuid) => Object.create({
      get: (cached = false, fileType = '.png') => this.http.get(`/api/live/device/${uuid}/${cached ? 'cached' : 'image'}${fileType}`),
      set: (img) => this.http.put(`/backend/${uuid}`, img)
    })
  }), 'create')

  sessions = Object.assign(this.#crud('session'), {
    restart: this.#restart('session', 'restart'),
    clearCache: (...uuids) => this.http.post('/api/session/webkit-clear-cache', uuids)
  })

  users = this.#crud('user')

  config = (data) => data ? this.http.put('/api/config/', data) : this.http.get('/api/config/')
  status = () => this.http.get('/api/status/')
  orphans = (all = true) => this.http.get(`/api/orphans?all=${all}`)
}

module.exports = VisionectApiClient
