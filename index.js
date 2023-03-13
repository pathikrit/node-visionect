const crypto = require('crypto')
const axios = require('axios')
const _ = require('lodash')

class VisionectApiClient {
  constructor({apiServer, apiKey, apiSecret}) {
    const hmac = (...args) => crypto.createHmac('sha256', apiSecret).update(args.join('\n')).digest('base64')
    this.http = axios.create({baseURL: _.trimEnd(apiServer, '/'), headers: {'Content-Type': 'application/json'}})
    this.http.interceptors.request.use(req => {
      req.method = req.method.toUpperCase()
      req.headers['Date'] = new Date().toUTCString()
      req.headers['Authorization'] = `${apiKey}:${hmac(req.method, '', req.headers['Content-Type'], req.headers['Date'], req.url)}`
      return req
    })
  }

  #crud = (name, restart) => new function (ctx) {
    this.get = (id) => ctx.http.get(`/api/${name}/${id || ''}`)
    this.create = (id, data) => ctx.http.post(`/api/${name}/${id}`, data)
    this.update = (arg1, arg2) => arg2 ? ctx.http.put(`/api/${name}/${arg1}`, arg2) : ctx.http.put(`/api/${name}/`, arg1)
    this.delete = (id) => ctx.http.delete(`/api/${name}/${id}`)
    this.patch = (id, data) => this.get(id).then(res => this.update(id, _.merge(res.data, data)))
    if (restart) this[restart] = (...uuids) => uuids.length === 1 ? ctx.http.post(`/api/${name}/${uuids[0]}/${restart}`) : ctx.http.post(`/api/${name}/${restart}`, uuids)
  }(this)

  #devices = _.omit(this.#crud('device', 'reboot'), 'create')
  devices = _.merge({}, this.#devices, {
    get: (uuid, from, to = Date.now()/1000, group = false) => from ? this.http.get(`/api/devicestatus/${uuid}`, {params: {from: Math.floor(from), to: Math.ceil(to), group: group}}) : this.#devices.get(uuid),
    config: {
      get: (uuid, types) => !types ? this.http.get(`/api/devicetclv/${uuid}`) :
        this.http.post(`/api/cmd/Param/${uuid}`, {Data: types.map(type => {return {Type: type, Control: 0, Value: ""}})}),
      set: (uuid, data) => this.http.post(`/api/cmd/Param/${uuid}`, data)
    }
  })

  view = {
    device: (uuid, fileType = '.png') => this.http.get(`/api/live/device/${uuid}/cached${fileType}`),
    server: (uuid, fileType = '.png') => this.http.get(`/api/live/device/${uuid}/image${fileType}`),
    set: (uuid, img) => this.http.put(`/backend/${uuid}`, img)
  }

  sessions = _.extend(this.#crud('session', 'restart'), {
    clearCache: (...uuids) => this.http.post('/api/session/webkit-clear-cache', uuids)
  })

  users = this.#crud('user')

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
