This is a lightweight nodejs Promise based wrapper around the [Visionect Server Management API](http://api.visionect.com/)

## Installation [![NPM Package Version](https://img.shields.io/npm/v/node-visionect.svg?)](https://www.npmjs.com/package/node-visionect)
```sh
npm add node-visionect
```

## Example
```js
const {VisionectApiClient} = require('node-joan');

const visionect = new VisionectApiClient('https://localhost:8081', 'apiKey', 'apiSecret')

visionect.devices.all.list().then(res => console.log(res))

visionect.device.update()
.then(res => console.log(res))
.catch(err => console.error(err))
```

## APIs
```js
visionect.devices.get() // get all devices
visionect.devices.get(uuid) // get a particular device

visionect.devices.reboot(uuid) // reboot one device
visionect.devices.reboot() // reboot all
```

### Primitive APIs
Directly call any HTTP endpoints using the following low level utils:
```js
visionect.get(path)
visionect.post(path, data)
visionect.put(path, data)
visionect.patch(path, data)
visionect.delete(path, data)
visionect.options(path)
```
