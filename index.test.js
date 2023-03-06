require('dotenv').config()
const {apiServer, apiKey, apiSecret, uuid} = process.env

const VisionectApiClient = require('./index.js')
const visionect = new VisionectApiClient(process.env)

// Monkey patch the call method
// visionect._call = visionect.call
// visionect.call = (method, path, data) => {
//   console.assert(method === 'GET', 'Aborting non-GET API call in tests')
//   return {method: method, path: path, promise: visionect._call(method, path, data)}
// }

visionect.http.interceptors.request.use(req => {
  console.assert(req.method === 'GET', 'Cannot make non-GET API calls from tests')
  return req
})

check = (...apis) => apis.forEach(api => {
  test(`${api.method} ${api.path}`, () => api.then(res => {
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
