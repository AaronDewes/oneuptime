[![npm](https://img.shields.io/npm/v/fyipe-server-monitor)](https://www.npmjs.com/package/fyipe-server-monitor)

# Fyipe Server Monitor

A fyipe shell package that monitor's server resources - disk, memory and CPU percentage - used.

## Installation

You can install to use on the CLI:

```bash
$ npm install -g fyipe-server-monitor
```

You can install to use in your project:

```bash
$ cd project
$ npm install fyipe-server-monitor
```

## CLI Usage

You can use on the CLI:

```bash
$ fyipe-server-monitor
```

-   Run `fyipe-server-monitor`.
-   Enter your Project ID, API URL, and API key - Get these from your Fyipe Dashboard.
-   Select Server Monitor from the list of Server Monitors.
-   Server will be pinged every minute and the data stored in your project.

You can also use it like this:

```bash
$ fyipe-server-monitor -p 5d64d59cae46131619708309 -u https://fyipe.com/api -a b02798c0-c898-11e9-9f14-4963dc67e2ab -m 5d7775e9f14a531364ba6917
```

Or run as a daemon:

```bash
$ fyipe-server-monitor -d -p 5d64d59cae46131619708309 -u https://fyipe.com/api -a b02798c0-c898-11e9-9f14-4963dc67e2ab -m 5d7775e9f14a531364ba6917
```

<a name="module_api"></a>

## Basic Usage

```javascript
const serverMonitor = require('fyipe-server-monitor');

const monitor = serverMonitor({
    projectId: '5d64d59cae46131619708309',
    // (optional) If you have installed Fyipe Platform on your server,
    // this should be your API URL
    apiUrl: 'https://fyipe.com/api',
    apiKey: 'b02798c0-c898-11e9-9f14-4963dc67e2ab',
    monitorId: '5d7775e9f14a531364ba6917',
    interval: '*/5 * * * * *', // cron job interval
    timeout: 10000, // milliseconds
});

monitor.start();
```

## Known Issues

#### Windows Temperature

`wmic` - is used to determine temperature and sometimes needs to be run with admin privileges. So if you do not get any values, try to run it again with according privileges. If you still do not get any values, your system might not support this feature.

#### Linux Temperature

In some cases you may need to install the linux `sensors` package to be able to measure temperature e.g. on DEBIAN based systems run `sudo apt-get install lm-sensors`.

See [system information](https://www.npmjs.com/package/systeminformation#known-issues) to learn more.

## API Documentation

Main API to authenticate user, start and stop server monitoring.

**See**

-   module:helpers
-   module:logger

**Author**: HackerBay, Inc.

-   [Fyipe Server Monitor](#fyipe-server-monitor)
    -   [Installation](#installation)
    -   [CLI Usage](#cli-usage)
    -   [Basic Usage](#basic-usage)
    -   [API Documentation](#api-documentation)
        -   [module.exports(config, apiUrl, apiKey, monitorId) ⇒ <code>Object</code> ⏏](#moduleexportsconfig-apiurl-apikey-monitorid--object-)
            -   [module.exports~ping(projectId, monitorId, apiUrl, apiKey, agentless, interval) ⇒ <code>Object</code>](#moduleexportspingprojectid-monitorid-apiurl-apikey-interval--object)
            -   [module.exports~start(id) ⇒ <code>Object</code> \| <code>number</code>](#moduleexportsstartid--object--number)
            -   [module.exports~stop() ⇒ <code>Object</code>](#moduleexportsstop--object)

<a name="exp_module_api--module.exports"></a>

### module.exports(config, apiUrl, apiKey, monitorId) ⇒ <code>Object</code> ⏏

Authenticate user and get list of server monitors if monitor id not provided.

**Kind**: Exported function
**Returns**: <code>Object</code> - The server monitor handlers.

| Param     | Type                                         | Description                                                             |
| --------- | -------------------------------------------- | ----------------------------------------------------------------------- |
| config    | <code>string</code> \| <code>Object</code>   | The project id or config of the project.                                |
| apiUrl    | <code>string</code>                          | The url of the api.                                                     |
| apiKey    | <code>string</code>                          | The api key of the project.                                             |
| monitorId | <code>string</code> \| <code>function</code> | The monitor id or function to resolve monitor id of the server monitor. |

<a name="module_api--module.exports..ping"></a>

#### module.exports~ping(projectId, monitorId, apiUrl, apiKey, agentless, interval) ⇒ <code>Object</code>

Get system information at interval and upload to server.

**Kind**: inner method of [<code>module.exports</code>](#exp_module_api--module.exports)
**Returns**: <code>Object</code> - The ping server cron job.

| Param     | Type                | Default                                 | Description                                                |
| --------- | ------------------- | --------------------------------------- | ---------------------------------------------------------- |
| projectId | <code>string</code> |                                         | The project id of the project.                             |
| monitorId | <code>string</code> |                                         | The monitor id of the server monitor.                      |
| apiUrl    | <code>string</code> |                                         | The url of the api.                                        |
| apiKey    | <code>string</code> |                                         | The api key of the project.                                |
| agentless | <code>Object</code> |                                         | The agentless config.                                      |
| interval  | <code>string</code> | <code>&quot;\* \* \* \* \*&quot;</code> | The interval of the cron job, must ba a valid cron format. |

<a name="module_api--module.exports..start"></a>

#### module.exports~start(id) ⇒ <code>Object</code> \| <code>number</code>

Start server monitor.

**Kind**: inner method of [<code>module.exports</code>](#exp_module_api--module.exports)
**Returns**: <code>Object</code> \| <code>number</code> - The ping server cron job or the error code.

| Param | Type                | Description                           |
| ----- | ------------------- | ------------------------------------- |
| id    | <code>string</code> | The monitor id of the server monitor. |

<a name="module_api--module.exports..stop"></a>

#### module.exports~stop() ⇒ <code>Object</code>

Stop server monitor.

**Kind**: inner method of [<code>module.exports</code>](#exp_module_api--module.exports)
**Returns**: <code>Object</code> - The ping server cron job.
