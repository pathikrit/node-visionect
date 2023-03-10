require('dotenv').config()
const {apiServer, apiKey, apiSecret, uuid} = process.env
const curlirize = require('axios-curlirize')

const VisionectApiClient = require('./index.js')
const visionect = new VisionectApiClient(process.env)
curlirize(visionect.http)

visionect.http.interceptors.request.use(req => {
  console.assert(req.method === 'GET', `Cannot make ${req.method} API calls from tests`)
  return req
})

test.each([
  visionect.devices.get(),
  visionect.devices.get(uuid),
  visionect.devices.config(uuid),
  visionect.devices.get(uuid, Date.now()/1000 - 60*60),
  visionect.view.device(uuid),
  visionect.view.server(uuid),
  visionect.sessions.get(),
  visionect.sessions.get(uuid),
  visionect.users.get(),
  visionect.users.get(apiKey),
  visionect.server.config(),
  visionect.server.status(),
  visionect.server.orphans(),
])('API call %#', f => f.then(res => {
  console.debug(res.request.method, res.request.path, '\n', res.headers['content-type'] === 'application/json' ? res.data : res.headers['content-type'])
  expect(res.status).toBe(200)
}))
