require('dotenv').config()
const {apiServer, apiKey, apiSecret, uuid} = process.env

const VisionectApiClient = require('./index.js')
const visionect = new VisionectApiClient(apiServer, apiKey, apiSecret)

check = (...apis) => apis.forEach(api => {
  test(`${api.method} ${api.path}`, () => api.promise.then(res => {
    console.debug(api.path, '\n', res.headers['content-type'] === 'application/json' ? res.data : res.headers['content-type'])
    expect(res.status).toBe(200)
  }))
})

check(
  visionect.devices.get(),
  visionect.devices.get(uuid),
  visionect.devices.config(uuid),
  visionect.sessions.get(),
  visionect.sessions.get(uuid),
  visionect.users.get(),
  visionect.users.get(apiKey),
  visionect.config(),
  visionect.status(),
  visionect.devices.view(uuid).get(),
  visionect.orphans(),
)
