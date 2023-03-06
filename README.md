# node-visionect [![CI](https://github.com/pathikrit/node-visionect/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/pathikrit/node-visionect/actions/workflows/ci.yml)

A thin node.js [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) based wrapper around the [Visionect Server Management API](http://api.visionect.com/)

## Installation [![NPM Package Version](https://img.shields.io/npm/v/node-visionect.svg?)](https://www.npmjs.com/package/node-visionect)
```sh
npm add node-visionect
```
## Example
```js
const VisionectApiClient = require('node-joan');

const visionect = new VisionectApiClient({
  apiServer: 'https://localhost:8081',
  apiKey: '<apiKey>',
  apiSecret: '<apiSecret>'
})

visionect.devices.get()
  .then(res => console.log(res.status, res.headers, res.data))
  .catch(err => console.error(err))

// Update URL
visionect.sessions.patch(uuid, {Backend: {Fields: {url: 'https://example.com'}}})
```
This library is used in production by the [Newswall project](https://github.com/pathikrit/newswall) - feel free to refer to it for further usage examples.

## APIs

### Devices APIs
```js
visionect.devices.get() // get all devices
visionect.devices.get(uuid) // get a particular device
visionect.devices.get(uuid, from, to = now, group = false) // Get an array of historical statuses; See http://api.visionect.com/#device-status-device-status

visionect.devices.update(uuid, data) // update a particular device
visionect.devices.update(data) // update all devices
visionect.devices.patch(uuid, data) // Partial update a device

visionect.devices.delete(uuid) // delete a devices

visionect.devices.status(uuid, from, to, group) 
visionect.devices.config(uuid) // Get config for device
visionect.devices.config(uuid, data) // Set config for device

visionect.devices.restart(uuid1, uuid2, /*...*/) // reboot devices
```

### Live View APIs
```js
visionect.devices.view(uuid).get() // return current image that is displayed on the device
visionect.devices.view(uuid).get(cached = true) // return the server side image for the device
visionect.devices.view(uuid).set(img) // Set the image on device; see http://api.visionect.com/#backends
```

### Session APIs
```js
visionect.sessions.get() // get all sessions
visionect.sessions.get(uuid) // get a particular session

visionect.sessions.update(uuid, data) // update a particular session
visionect.sessions.update(data) // update all sessions
visionect.sessions.patch(uuid, data) // Partial update a session

visionect.sessions.create(data) // create a session

visionect.sessions.restart(uuid1, uuid2, /*...*/) // restart sessions
visionect.sessions.clearCache(uuid1, uuid2, /*...*/) // clear session caches
```

### User APIs
```js
visionect.users.get() // get all users
visionect.users.get(username) // get a particular user

visionect.users.update(username, data) // update a particular user
visionect.users.update(data) // update all users
visionect.users.patch(uuid, data) // Partial update a user

visionect.users.create(data) // create a user
```

### Server APIs
```js
visionect.status() // Get server status
visionect.config() // Get server config
visionect.config(data) // Set server config
visionect.orphans(all = true) // See http://api.visionect.com/#health
```

### Primitive APIs
Directly call any HTTP endpoints using the following low level utils:
```js
visionect.http.get(path)
visionect.http.post(path, data)
visionect.http.put(path, data)
visionect.http.patch(path, data)
visionect.http.delete(path, data)
visionect.http.options(path)
```

### Intercept Requests / Responses
Use [axios interceptors](https://axios-http.com/docs/interceptors) to intercept requests/response:
```js
visionect.http.interceptors.request.use(req => {
  console.assert(process.env.NODE_ENV !== 'test' || req.method === 'GET', 'Cannot make non-GET API calls from tests')
  return req
})
```
