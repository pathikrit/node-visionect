require('dotenv').config()

const {VisionectApiClient} = require('./index.js')
const visionect = new VisionectApiClient(process.env.apiServer, process.env.apiKey, process.env.apiSecret)

check = (apis) => apis.forEach(api => test(api.name, () => api.promise.then(res => expect(res.status).toBe(200))))

check([
  visionect.devices.get(),
  visionect.devices.get('2a002800-0c47-3133-3633-333400000000'),
  visionect.devices.config('2a002800-0c47-3133-3633-333400000000')
])