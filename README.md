# Auth0 Logs to Cloud Logging

A simple script extracing Auth0 Logs and writing them to Google Cloud Logging.
Auth0 stores logs for limited time, so it's recommended to store them in an
external place. Currently there is no official extension for exporting logs to
Google Cloud Logging.

## Under the hood

To read logs this script uses LogsApiStream from 
[auth0-extensions/auth0-log-extension-tools](https://github.com/auth0-extensions/auth0-log-extension-tools)
that are being used in official Auth0 extensions for extracting logs.

To write them back to Google Cloud Logging, official
[@google-cloud/logging](https://github.com/googleapis/nodejs-logging) node.js library is used.

## How to use it?

It's as simple as:

```js
import { connectLogs } from 'auth0-logs-to-cloud-logging'

connectLogs({ ...config, checkpointId: fetchCheckpoint() })
  .then((result) => storeCheckpoint(result.checkpointId))
  .catch((error) => console.log("Oh no!", error))
```

If you don't provide `checkpointId` while calling the function it will attempt
fetching all your logs. In production environments this will most probably fail
to fetch all of them, given Auth0 limits the number of API calls you can perform.

You need to write your own logic for storing and fetching `checkpointId`
(`fetchCheckpoint()` and `storeCheckpoint(id)` in example above) to ensure that
you're always fetching trying to fetch only logs that you actually need.

## Configuration

Configuration object you have to provide to the function and their default
values

```
{
  auth0: {
    domain: 'name.auth0.com', // requried, your Auth0 domain
    clientId: null,           // required, clientId for Auth0 machine-to-machine
                              // client with logs:read permission
    clientSecret: null        // required, clientSecret for the above client
  },
  google: {
    projectId: null,          // required, Google projectId under which logs
                              // will be stored
    logName: 'auth0-logs',    // name of the log in Cloud Logging

    location: 'Europe',       // location, namespace and nodeId are sent as metadata
    namespace: 'auth0',       // with every Cloud Logging entry, as per [documentation](https://cloud.google.com/monitoring/api/resources#tag_generic_node)
    nodeId: domain            // nodeId defaults to Auth0 domain
  },
  connector: {
    batchSize: 50,
    logger: null              // a logger object, if you want to see 
                              // debug messages (e.g. `console`)
    checkpointId: null        // id of last fetched log message
  }
}
```
For Cloud Logging this script expects to be run in the environment with access to service account
with Log Writer permisssions (https://cloud.google.com/docs/authentication/getting-started)

## Return value

The function returns a promise which resolves with following object when
fetching of the logs from Auth0 ended. This can happen either because there is no more logs, or
because the request limit has been reached.

### `resolve(object)`

```
{
  startingCheckpointId: '...',  // ID of the starting checkpoint
  checkpointId: '...',          // string with ID of last fetched log entry
  logsProcessed: 0,             // number of log entries processed
  limits: {                     // returned from Auth0 library representing API limits
    limit: '50',
    remaining: '48',
    reset: '1585823889',
  }
}
```

### `reject(err)`

Error object
