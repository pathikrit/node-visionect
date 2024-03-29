require('dotenv').config()
const {apiServer, apiKey, apiSecret, uuid} = process.env
const curlirize = require('axios-curlirize')

const VisionectApiClient = require('./index.js')
const vss = new VisionectApiClient(process.env)
curlirize(vss.http)

vss.http.interceptors.request.use(req => req.method.toUpperCase() === 'GET' ? req : Promise.reject(`Cannot make ${req.method} API calls from tests`))

test.each([
  vss.devices.get(),
  vss.devices.get(uuid),
  vss.devices.config.get(uuid),
  //vss.devices.config.get(uuid, [49, 65]),
  vss.devices.get(uuid, Date.now()/1000 - 60*60),
  vss.view.device(uuid),
  vss.view.server(uuid),
  vss.sessions.get(),
  vss.sessions.get(uuid),
  vss.users.get(),
  vss.users.get(apiKey),
  vss.server.config(),
  vss.server.status(),
  vss.server.orphans(),
])('API call %#', f => f.then(res => {
  console.debug(res.request.method, res.request.path, '\n', res.data)
  expect(res.status).toBe(200)
}))
