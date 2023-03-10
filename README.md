# node-visionect [![CI](https://github.com/pathikrit/node-visionect/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/pathikrit/node-visionect/actions/workflows/ci.yml)

A thin node.js [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) based wrapper around the [Visionect Server Management API](http://api.visionect.com/)

## Installation [![NPM Package Version](https://img.shields.io/npm/v/node-visionect.svg?)](https://www.npmjs.com/package/node-visionect)
```sh
npm add node-visionect
```
## Example
```js
const VisionectApiClient = require('node-joan')

const vss = new VisionectApiClient({
  apiServer: 'https://localhost:8081',
  apiKey: '<apiKey>',
  apiSecret: '<apiSecret>'
})

vss.devices.get()
  .then(res => console.log(res.status, res.headers, res.data))
  .catch(err => console.error(err))

// Update URL
vss.sessions.patch(uuid, {Backend: {Fields: {url: 'https://example.com'}}})
```
This library is used in production by the [Newswall project](https://github.com/pathikrit/newswall) - feel free to refer to it for further usage examples.

## APIs

### Devices APIs
```js
vss.devices.get() // get all devices
vss.devices.get(uuid) // get a particular device
vss.devices.get(uuid, from, to = now, group = false) // Get an array of historical statuses; See http://api.vss.com/#device-status-device-status

vss.devices.update(uuid, data) // update a particular device
vss.devices.update(data) // update all devices
vss.devices.patch(uuid, data) // Partial update a device

vss.devices.delete(uuid) // delete a devices

vss.devices.config(uuid) // Get config for device
vss.devices.config(uuid, data) // Set config for device

vss.devices.reboot(uuid1, uuid2, /*...*/) // reboot devices
```

### Live View APIs
```js
vss.view.device(uuid) // return current image that is displayed on the device
vss.view.server(uuid) // return the server side image for the device
vss.view.set(uuid, img) // Set the image on device; see http://api.vss.com/#backends
```

### Session APIs
```js
vss.sessions.get() // get all sessions
vss.sessions.get(uuid) // get a particular session

vss.sessions.update(uuid, data) // update a particular session
vss.sessions.update(data) // update all sessions
vss.sessions.patch(uuid, data) // Partial update a session

vss.sessions.create(data) // create a session

vss.sessions.restart(uuid1, uuid2, /*...*/) // restart sessions
vss.sessions.clearCache(uuid1, uuid2, /*...*/) // clear session caches
```

### User APIs
```js
vss.users.get() // get all users
vss.users.get(username) // get a particular user

vss.users.update(username, data) // update a particular user
vss.users.update(data) // update all users
vss.users.patch(uuid, data) // Partial update a user

vss.users.create(data) // create a user
```

### Server APIs
```js
vss.server.status() // Get server status
vss.server.config() // Get server config
vss.server.config(data) // Set server config
vss.server.config(data, patch = true) // Partial update server config
vss.server.orphans(all = true) // See http://api.vss.com/#health
```

### Primitive APIs
Directly call any HTTP endpoints using the following low level utils:
```js
vss.http.get(path)
vss.http.post(path, data)
vss.http.put(path, data)
vss.http.patch(path, data)
vss.http.delete(path, data)
vss.http.options(path)
```

### Plugins
You can access the underlying [axios](https://axios-http.com/) HTTP caller via `vss.http`.
This makes it possible to use any [axios plugins](https://www.npmjs.com/search?ranking=popularity&q=axios) e.g.
```js
// This will print all API calls as curl commands to console
const curlirize = require('axios-curlirize')
curlirize(vss.http)
```

### Intercept Requests / Responses
Use [axios interceptors](https://axios-http.com/docs/interceptors) to intercept requests/response:
```js
// Intercept requests e.g. to block certain calls
vss.http.interceptors.request.use(req => {
  return (process.env.NODE_ENV === 'test' && req.method.toUpperCase() !== 'GET') ?
    Promise.reject(`Cannot make ${req.method} API calls from tests`) : req
})

// Intercept responses e.g. to log the response / request
vss.http.interceptors.response.use(
  res => {
    console.log(res.request.method, res.request.path, res.status, res.headers)
    return res
  },
  err => {
    console.error('Received non-2xx response', err)
    return Promise.reject(err)
  }
)

// 3rd party logger: https://github.com/hg-pyun/axios-logger
vss.http.interceptors.request.use(AxiosLogger.requestLogger)
```
