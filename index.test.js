require('dotenv').config()
const {apiServer, apiKey, apiSecret, uuid} = process.env

const VisionectApiClient = require('./index.js')
const visionect = new VisionectApiClient(process.env)

visionect.http.interceptors.request.use(req => {
  req.method = req.method.toUpperCase()
  console.assert(req.method === 'GET', `Cannot make ${req.method} API calls from tests`)
  return req
})

visionect.http.interceptors.response.use(res => {
  console.debug(res.config.method, res.config.url, '\n', res.headers['content-type'] === 'application/json' ? res.data : res.headers['content-type'])
  expect(res.status).toBe(200)
  return res
})

check = (...tests) => tests.forEach(t => test(t[0], () => t[1].then(_ => {})))

check(
  ['Get all devices', visionect.devices.get()],
  ['Get one device', visionect.devices.get(uuid)],
  ['Get device config', visionect.devices.config(uuid)],
  ['Get device status', visionect.devices.get(uuid, Date.now()/1000 - 60*60)],
  ['Get all sessions', visionect.sessions.get()],
  ['Get one session', visionect.sessions.get(uuid)],
  ['Get all users', visionect.users.get()],
  ['Get one user', visionect.users.get(apiKey)],
  ['Get server config', visionect.config()],
  ['Get server status', visionect.status()],
  ['Get live view', visionect.devices.view(uuid).get()],
  ['Get server orphans', visionect.orphans()],
)
