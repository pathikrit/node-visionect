require('dotenv').config()

const {VisionectApiClient} = require('./index.js')
const visionect = new VisionectApiClient(process.env.apiServer, process.env.apiKey, process.env.apiSecret)

//client.devices.get().then(res => console.log(res))
//client.devices.get('2a002800-0c47-3133-3633-333400000000').then(res => console.log(res))
visionect.devices.config.get('2a002800-0c47-3133-3633-333400000000').then(res => console.log(res))