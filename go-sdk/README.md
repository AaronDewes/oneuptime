# Fyipe SDK

A fyipe sdk for application logger that can be used to send logs about your applications created on your fypie dashboard which can also used for error tracking

## Installation

### Go Install

Via Go

```
 // TODO how to install package
```

<a name="module_api"></a>

## Basic Usage for Logging

```go
// TODO fix import properly
import (
    "fmt"
)

// constructor
option := LoggerOptions{
    ApiUrl: "API_URL",  // https://fyipe.com/api
    ApplicationLogId: "APPLICATION_LOG_ID",
    ApplicationLogKey: "APPLICATION_LOG_KEY",
}

// initalization
Init(option)

// Sending a string log to the server
item := "This is a simple log"

// empty tag
var tag = []string{}

logResponse, logErr := LogInfo(item, tag)

// response after logging a request
fmt.PrintF("Log Info response: %v", logResponse)
fmt.PrintF("Log Info error: %v", logErr)


// Sending a struct log to the server
type StructA struct {
    Name string
    Location string
}
item := StructA{"Tony Lewinsky","Liverpool"}
// empty tag
var tag = []string{}

logResponse, logErr := LogInfo(item, tag)

// response after logging a request
ffmt.PrintF("Log Info error: %v", logErr)

// alternatively, tags can be added to the logged item.
item := "This is a simple log"

// using a tag string
var tag = []string{"server-side-error"}
logResponse, logErr := LogWarning(item, tag)

// response after logging a request
fmt.PrintF("Log Warning response: %v", logResponse)
fmt.PrintF("Log Warning error: %v", logErr)

// Using an array of strings
var tags = []string{"server", "error"}

logResponse, logErr := LogError(item, tags)

// response after logging a request
fmt.PrintF("Log Error response: %v", logResponse)
fmt.PrintF("Log Error error: %v", logErr)
```

## Basic Usage for Tracking

```go
// TODO fix import properly
import (
    "fmt"
)

// set up tracking configurations
timelineOpt := TrackerOption{
	MaxTimeline:        2,
	CaptureCodeSnippet: true,
}

option := FyipeTrackerOption{
	ErrorTrackerId:  "ERROR_TRACKER_ID",
	ErrorTrackerKey: "ERROR_TRACKER_KEY",
	ApiUrl:          "API_URL", // https://fyipe.com/api,
	Options:         timelineOpt, // optional
}
InitTracker(option)

// capturing a timeline manually
var customTimeline = &Timeline{
	Category: "testing",
	Data:     "payment-confirmation",
	Type:     "info",
}
AddToTimeline(customTimeline)

// setting custom tags
// a single tag
SetTag("location","Warsaw")

// multiple tags
// create three tags
tags := map[string]string{
	"location": "Warsaw",
	"agent":    "Safari",
	"actor":    "Tom Cruise",
}

// setting the array of tags
SetTags(tags)

// all error exception captured are set to your fyipe dashboard

// this sdk can capture errors managed by  go-errors or pkg/errors
err := errors.Errorf("Dang! Error Happened")
// capture error
CaptureException(err)

// alternatively, you can capture error using the message method
CaptureMessage("Dang! Error Again")

```

## API Documentation

Main API to send logs to the server.

**Author**: HackerBay, Inc.

-   [Fyipe SDK](#fyipe-sdk)
    -   [Installation](#installation)
        -   [Go Install](#go-install)
    -   [Basic Usage for Logging](#basic-usage-for-logging)
    -   [Basic Usage for Tracking](#basic-usage-for-tracking)
    -   [API Documentation](#api-documentation)
        -   [Init(LoggerOptions)](#initloggeroptions)
        -   [LoggerOptions](#loggeroptions)
            -   [LogInfo(log, tags)](#loginfolog-tags)
            -   [LogWarning(warning, tags)](#logwarningwarning-tags)
            -   [LogError(error, tags)](#logerrorerror-tags)

<a name="logger_api--logger"></a>

### Init(LoggerOptions)

Create a constructor from the class, which will be used to send logs to the server.

**Kind**: Constructor
**Returns**: <code>Initialized Logger</code>

| Param         | Type                | Description                                     |
| ------------- | ------------------- | ----------------------------------------------- |
| LoggerOptions | <code>struct</code> | The Object containing the Log Container details |

### LoggerOptions

LoggerOption
**Kind**: Struct
**Returns**: <code>null</code>

| Param             | Type                | Description              |
| ----------------- | ------------------- | ------------------------ |
| ApiUrl            | <code>string</code> | The Server URL.          |
| ApplicationLogId  | <code>string</code> | The Application Log ID.  |
| ApplicationLogKey | <code>string</code> | The Application Log Key. |

#### LogInfo(log, tags)

Logs a request of type `info` to the server.

**Kind**: method of [<code>FyipeLogger.new</code>](#logger_api--logger)
**Returns**: <code>Object</code> - An object response of a success or failure.

| Param | Type                                       | Description                                                 |
| ----- | ------------------------------------------ | ----------------------------------------------------------- |
| log   | <code>string</code> \| <code>Struct</code> | The content to the logged on the server.                    |
| tags  | <code>string</code> \| <code>Array</code>  | The tag(s) to be attached to the logged item on the server. |

#### LogWarning(warning, tags)

Logs a request of type `warning` to the server.

**Kind**: method of [<code>FyipeLogger.new</code>](#logger_api--logger)
**Returns**: <code>Object</code> - An object response of a success or failure.

| Param   | Type                                       | Description                                                 |
| ------- | ------------------------------------------ | ----------------------------------------------------------- |
| warning | <code>string</code> \| <code>Struct</code> | The content to the logged on the server.                    |
| tags    | <code>string</code> \| <code>Array</code>  | The tag(s) to be attached to the logged item on the server. |

#### LogError(error, tags)

Logs a request of type `error` to the server.

**Kind**: method of [<code>FyipeLogger.new</code>](#logger_api--logger)
**Returns**: <code>Object</code> - An object response of a success or failure.

| Param | Type                                       | Description                                                 |
| ----- | ------------------------------------------ | ----------------------------------------------------------- |
| error | <code>string</code> \| <code>Struct</code> | The content to the logged on the server.                    |
| tags  | <code>string</code> \| <code>Array</code>  | The tag(s) to be attached to the logged item on the server. |
