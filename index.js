const crypto = require('crypto')
const axios = require('axios')
const _ = require('lodash')

class VisionectApiClient {
  constructor(config) {
    const hmac = (...args) => crypto.createHmac('sha256', config.apiSecret).update(args.join('\n')).digest('base64')
    this.http = axios.create({baseURL: _.trimEnd(config.apiServer, '/'), headers: {'Content-Type': 'application/json'}})
    this.http.interceptors.request.use(req => {
      req.headers['Date'] = new Date().toUTCString()
      req.headers['Authorization'] = `${config.apiKey}:${hmac(req.method.toUpperCase(), '', req.headers['Content-Type'], req.headers['Date'], req.url)}`
      return req
    })
  }

  #crud = (name) => new function (ctx) {
    this.get = (id) => ctx.http.get(`/api/${name}/${id || ''}`)
    this.create = (id, data) => ctx.http.post(`/api/${name}/${id}`, data)
    this.update = (arg1, arg2) => arg2 ? ctx.http.put(`/api/${name}/${arg1}`, arg2) : ctx.http.put(`/api/${name}/`, arg1)
    this.delete = (id) => ctx.http.delete(`/api/${name}/${id}`)
    this.patch = (id, data) => this.get(id).then(res => this.update(id, _.merge(res.data, data)))
    this.restart = (...uuids) => {
      const method = name === 'device' ? 'reboot' : 'restart'
      return uuids.length === 1 ? ctx.http.post(`/api/${name}/${uuids[0]}/${method}`) : ctx.http.post(`/api/${name}/${method}`, uuids)
    }
  }(this)

  #devices = _.omit(this.#crud('device'), 'create')
  devices = _.merge({}, this.#devices, {
    get: (uuid, from, to = Date.now()/1000, group = false) => from ? this.http.get(`/api/devicestatus/${uuid}`, {params: {from: Math.floor(from), to: Math.ceil(to), group: group}}) : this.#devices.get(uuid),
    config: (uuid, data) => data ? this.http.post(`/api/cmd/Param/${uuid}`, data) : this.http.get(`/api/devicetclv/${uuid}`),
  })

  view = {
    device: (uuid, fileType = '.png') => this.http.get(`/api/live/device/${uuid}/cached${fileType}`),
    server: (uuid, fileType = '.png') => this.http.get(`/api/live/device/${uuid}/image${fileType}`),
    set: (uuid, img) => this.http.put(`/backend/${uuid}`, img)
  }

  sessions = _.extend(this.#crud('session'), {
    clearCache: (...uuids) => this.http.post('/api/session/webkit-clear-cache', uuids)
  })

  users = _.omit(this.#crud('user'), 'restart')

  server = {
    config: (data, patch = false) => {
      const get = () => this.http.get('/api/config/')
      const put = (data) => this.http.put('/api/config/', data)
      return data ? (patch ? get().then(res => put(_.merge(res.data, data))) : put(data)) : get()
    },
    status: () => this.http.get('/api/status/'),
    orphans: (all = true) => this.http.get('/api/orphans', {params: {all: all}})
  }
}

module.exports = VisionectApiClient
