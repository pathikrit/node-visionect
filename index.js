const crypto = require("crypto")
const axios = require('axios')

class VisionectApiClient {
  constructor(apiServer, apiKey, apiSecret) {
    this.call = (method, path, data) => {
      const hmac = str => crypto.createHmac('sha256', apiSecret).update(str).digest("base64")
      const headers = {'Date': new Date().toUTCString(), 'Content-Type': 'application/json',}
      headers['Authorization'] = `${apiKey}:${hmac([method, '', headers['Content-Type'], headers['Date'], path].join('\n'))}`
      return axios({method: method, url: apiServer + path, headers: headers, data: data}).then(res => res.data)
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
    update: (uuid, data) => this.put(`/api/device/${uuid}`, data),
    updateAll: (data) => this.put(`/api/device/`, data),
    delete: (uuid) => this.delete(`/api/device/${uuid}`),
    config: {
      get: (uuid) => this.get(`/api/devicetclv/${uuid}`),
      set: (uuid, data) => this.post(`/api/cmd/Param/${uuid}`, data)
    },
    reboot: (uuid) => this.post(uuid ? `/api/device/${uuid}/reboot` : '/api/device/reboot')
  }

  users = {
    list: () => this.get('/api/user/')
  }
}

module.exports = {VisionectApiClient}
