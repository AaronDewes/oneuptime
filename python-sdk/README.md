# OneUptime SDK

A oneuptime sdk for application logger that can be used to send logs about your applications created on your fypie dashboard which can also used for error tracking

## Usage

Usage can be found at [Examples and Usage](README.rst)

## API Documentation

Main API to send logs to the server.

**Author**: HackerBay, Inc.

<a name="logger_api--logger"></a>

### FyipeLogger(apiUrl, applicationId, applicationKey)

Create a constructor from the class, which will be used to send logs to the server.

**Kind**: Constructor
**Returns**: <code>null</code>

| Param          | Type                | Description              |
| -------------- | ------------------- | ------------------------ |
| apiUrl         | <code>string</code> | The Server URL.          |
| applicationId  | <code>string</code> | The Application Log ID.  |
| applicationKey | <code>string</code> | The Application Log Key. |

#### logger.log(log, tags)

Logs a request of type `info` to the server.

**Kind**: method of [<code>FyipeLogger</code>](#logger_api--logger)
**Returns**: <code>Object</code> - An object response of a success or failure.

| Param | Type                                       | Description                                                 |
| ----- | ------------------------------------------ | ----------------------------------------------------------- |
| log   | <code>string</code> \| <code>Object</code> | The content to the logged on the server.                    |
| tags  | <code>string</code> \| <code>Array</code>  | The tag(s) to be attached to the logged item on the server. |

#### logger.warning(warning, tags)

Logs a request of type `warning` to the server.

**Kind**: method of [<code>FyipeLogger</code>](#logger_api--logger)
**Returns**: <code>Object</code> - An object response of a success or failure.

| Param   | Type                                       | Description                                                 |
| ------- | ------------------------------------------ | ----------------------------------------------------------- |
| warning | <code>string</code> \| <code>Object</code> | The content to the logged on the server.                    |
| tags    | <code>string</code> \| <code>Array</code>  | The tag(s) to be attached to the logged item on the server. |

#### logger.error(error, tags)

Logs a request of type `error` to the server.

**Kind**: method of [<code>FyipeLogger</code>](#logger_api--logger)
**Returns**: <code>Object</code> - An object response of a success or failure.

| Param | Type                                       | Description                                                 |
| ----- | ------------------------------------------ | ----------------------------------------------------------- |
| error | <code>string</code> \| <code>Object</code> | The content to the logged on the server.                    |
| tags  | <code>string</code> \| <code>Array</code>  | The tag(s) to be attached to the logged item on the server. |

<a name="tracker_api--tracker"></a>

### FyipeTracker(apiUrl, errorTrackerId, errorTrackerKey)

Create a constructor from the class, which will be used to track errors sent to the server.

**Kind**: Constructor
**Returns**: <code>null</code>

| Param           | Type                | Description                                 |
| --------------- | ------------------- | ------------------------------------------- |
| apiUrl          | <code>string</code> | The Server URL.                             |
| errorTrackerId  | <code>string</code> | The Error Tracker ID.                       |
| errorTrackerKey | <code>string</code> | The Error Tracker Key.                      |
| option          | <code>object</code> | The options to be considred by the tracker. |

#### options

| Param              | Type                 | Description                                                                                           |
| ------------------ | -------------------- | ----------------------------------------------------------------------------------------------------- |
| maxTimeline        | <code>int</code>     | The total amount of timeline that should be captured, defaults to 5                                   |
| captureCodeSnippet | <code>boolean</code> | When set as `True` stack traces are automatically attached to all error sent to your fyipe dashboard. |

#### tracker.setTag(key, value)

Set tag for the error to be sent to the server.

**Kind**: method of [<code>FyipeTracker</code>](#tracker_api--tracker)
**Returns**: <code>null</code>

| Param | Type                | Description            |
| ----- | ------------------- | ---------------------- |
| key   | <code>string</code> | The key for the tag.   |
| value | <code>string</code> | The value for the tag. |

#### tracker.setTags([{key, value}])

Set multiple tags for the error to be sent to the server. Takes in a list

**Kind**: method of [<code>FyipeTracker</code>](#tracker_api--tracker)
**Returns**: <code>null</code>

| Param | Type                | Description            |
| ----- | ------------------- | ---------------------- |
| key   | <code>string</code> | The key for the tag.   |
| value | <code>string</code> | The value for the tag. |

#### tracker.setFingerprint(fingerprint)

Set fingerprint for the next error to be captured.

**Kind**: method of [<code>FyipeTracker</code>](#tracker_api--tracker)
**Returns**: <code>null</code>

| Param       | Type                                                | Description                                                   |
| ----------- | --------------------------------------------------- | ------------------------------------------------------------- |
| fingerprint | <code>string</code> \| <code>list of strings</code> | The set of string used to group error messages on the server. |

#### tracker.addToTimeline(category, content, type)

Add a custom timeline element to the next error to be sent to the server

**Kind**: method of [<code>FyipeTracker</code>](#tracker_api--tracker)
**Returns**: <code>null</code>

| Param    | Type                                     | Description                         |
| -------- | ---------------------------------------- | ----------------------------------- |
| category | <code>string</code>                      | The category of the timeline event. |
| content  | <code>string</code> \| <code>dict</code> | The content of the timeline event.  |
| type     | <code>string</code>                      | The type of timeline event.         |

#### tracker.captureMessage(message)

Capture a custom error message to be sent to the server

**Kind**: method of [<code>FyipeTracker</code>](#tracker_api--tracker)
**Returns**: <code>Promise</code>

| Param   | Type                | Description                           |
| ------- | ------------------- | ------------------------------------- |
| message | <code>string</code> | The message to be sent to the server. |

#### tracker.captureException(error)

Capture a custom error object to be sent to the server

**Kind**: method of [<code>FyipeTracker</code>](#tracker_api--tracker)
**Returns**: <code>Promise</code>

| Param | Type                          | Description                                |
| ----- | ----------------------------- | ------------------------------------------ |
| error | <code>Exception object</code> | The Error Object to be sent to the server. |

## Contribution

-   Clone repository
-   run `pip install -r requirements.txt` to install dependencies
-   run `python -m unittest discover -s fyipe_sdk/tests` to run tests
