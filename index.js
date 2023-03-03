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

  devices = {
    get: (uuid) => this.get(`/api/device/${uuid || ''}`),
    update: (arg1, arg2) => arg2 ? this.put(`/api/device/${arg1}`, arg2) : this.put(`/api/device/`, arg1),
    delete: (uuid) => this.delete(`/api/device/${uuid}`),
    config: (uuid, data) => data ? this.post(`/api/cmd/Param/${uuid}`, data) : this.get(`/api/devicetclv/${uuid}`),
    reboot: (uuid) => this.post(uuid ? `/api/device/${uuid}/reboot` : '/api/device/reboot')
  }

  sessions = {
    get: (uuid) => this.get(`/api/session/${uuid || ''}`),
    create: (uuid, data) => this.post(`/api/session/${uuid}`, data),
    update: (arg1, arg2) => arg2 ? this.put(`/api/session/${arg1}`, arg2) : this.put(`/api/session/`, arg1),
    delete: (uuid) => this.delete(`/api/session/${uuid}`),
    restart: (uuid) => this.post(uuid ? `/api/session/${uuid}/restart` : '/api/device/restart'),
    clearCache: (...uuids) => this.post('/api/session/webkit-clear-cache', uuids)
  }

  users = {
    list: () => this.get('/api/user/')
  }
}

module.exports = {VisionectApiClient}
