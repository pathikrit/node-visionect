# node-visionect [![CI](https://github.com/pathikrit/node-visionect/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/pathikrit/node-visionect/actions/workflows/ci.yml)

A lightweight node.js Promise based wrapper around the [Visionect Server Management API](http://api.visionect.com/)

## Installation [![NPM Package Version](https://img.shields.io/npm/v/node-visionect.svg?)](https://www.npmjs.com/package/node-visionect)
```sh
npm add node-visionect
```
## Example
```js
const VisionectApiClient = require('node-joan');

const visionect = new VisionectApiClient('https://localhost:8081', 'apiKey', 'apiSecret')

visionect.devices.get().then(res => console.log(res))

visionect.devices.update()
  .then(res => console.log(res))
  .catch(err => console.error(err))
```

## APIs

### Devices APIs
```js
visionect.devices.get() // get all devices
visionect.devices.get(uuid) // get a particular device

visionect.devices.update(uuid, data) // update a particular device
visionect.devices.update(data) // update all devices

visionect.devices.delete(uuid) // delete a devices

visionect.devices.config(uuid) // Get config for device
visionect.devices.config(uuid, data) // Set config for device

visionect.devices.reboot(uuid) // reboot one device
visionect.devices.reboot() // reboot all devices
```

### Session APIs
```js
visionect.sessions.get() // get all sessions
visionect.sessions.get(uuid) // get a particular session

visionect.sessions.update(uuid, data) // update a particular session
visionect.sessions.update(data) // update all sessions

visionect.sessions.create(data) // create a session

visionect.sessions.restart(uuid) // restart a session
visionect.sessions.restart() // restart all sessions
visionect.sessions.clearCache(uuid1, uuid2, /*...*/) // restart sessions for given uuids
```

### User APIs
```js
visionect.users.get() // get all users
visionect.users.get(username) // get a particular user

visionect.users.update(username, data) // update a particular user
visionect.users.update(data) // update all users

visionect.users.create(data) // create a user
```

### Config APIs
```js
visionect.config() // Get server config
visionect.config(data) // Set server config
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
