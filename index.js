const crypto = require("crypto")
const axios = require('axios')

class VisionectApiClient {
  constructor(apiServer, apiKey, apiSecret) {
    this.call = (method, path, data) => {
      const hmac = str => crypto.createHmac('sha256', apiSecret).update(str).digest("base64")
      const headers = {'Date': new Date().toUTCString(), 'Content-Type': 'application/json',}
      headers['Authorization'] = `${apiKey}:${hmac([method, '', headers['Content-Type'], headers['Date'], path].join('\n'))}`
      const promise = axios({method: method, url: apiServer + path, headers: headers, data: data})
      return process.env.NODE_ENV === 'test' ? {method: method, path: path, promise: promise} : promise.then(res => res.data)
    }
  }

  get = (path) => this.call('GET', path)
  post = (path, data) => this.call('POST', path, data)
  put = (path, data) => this.call('PUT', path, data)
  patch = (path, data) => this.call('PATCH', path, data)
  delete = (path, data) => this.call('DELETE', path, data)
  options = (path) => this.call('OPTIONS', path)

  crud = (name) => Object.create({
    get: (id) => this.get(`/api/${name}/${id || ''}`),
    create: (id, data) => this.post(`/api/${name}/${id}`, data),
    update: (arg1, arg2) => arg2 ? this.put(`/api/${name}/${arg1}`, arg2) : this.put(`/api/${name}/`, arg1),
    delete: (id) => this.delete(`/api/${name}/${id}`),
  })

  devices = Object.assign(this.crud('device'), {
    config: (uuid, data) => data ? this.post(`/api/cmd/Param/${uuid}`, data) : this.get(`/api/devicetclv/${uuid}`),
    reboot: (uuid) => this.post(uuid ? `/api/device/${uuid}/reboot` : '/api/device/reboot')
  })
  //TODO: delete devices['create'];

  sessions = Object.assign(this.crud('session'), {
    restart: (uuid) => this.post(uuid ? `/api/session/${uuid}/restart` : '/api/device/restart'),
    clearCache: (...uuids) => this.post('/api/session/webkit-clear-cache', uuids)
  })

  users = this.crud('user')

  config = (data) => data ? this.put('/api/config/', data) : this.get('/api/config/')
}

module.exports = VisionectApiClient
