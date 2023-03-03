require('dotenv').config()
const {apiServer, apiKey, apiSecret, uuid} = process.env

const {VisionectApiClient} = require('./index.js')
const visionect = new VisionectApiClient(apiServer, apiKey, apiSecret)

check = (apis) => apis.forEach(api => test(api.name, () => api.promise.then(res => expect(res.status).toBe(200))))

check([
  visionect.devices.get(),
  visionect.devices.get(uuid),
  visionect.devices.config(uuid)
])