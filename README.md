# async-queue

Async queue abstraction created on NodeJS to perform multiple operations in limited streams on the server-side of your application.

## Installation

### git

```shell
git clone https://github.com/kol-oss/async-queue.git
```

### npm

```shell
npm i @kol-oss/async-queue
```

## Usage

```js
"use strict";

const { Queue } = require("@kol-oss/async-queue");
const { log } = require("./logger");

const timeout = (ms, callback) => setTimeout(callback, ms);

// Set max concurrent streams: 3
// Active from the beginning
const queue = new Queue(3, { paused: false });

// Set listeners callbacks
queue
  .onExecute((args) => log(`Timer [${args}] started`, "process"))
  .onResume(() => log("Execution started", "process"))
  .onSuccess((data, args) => {
    log(`Timer [${args}] was completed`, "success");
  })
  .onFail((error) => log(error, "error"))
  .onComplete(() => log("Execution finished", "process"));

// Add first timers to be executed
queue
  .push(timeout, 10000)
  .push(timeout, 1000)
  .push(timeout, 3000);

// Add timers after 1500 msec
setTimeout(() => {
  log("1500 msec expired", "process");
  queue
    .push(timeout, 2100)
    .push(timeout, 2200)
    .push(timeout, 2300);
}, 1500);

// Timer [10000] started
// Timer [1000] started
// Timer [3000] started
// Timer [1000] was completed
// 1500 msec expired
// Timer [2100] started
// Timer [3000] was completed
// Timer [2200] started
// Timer [2100] was completed
// Timer [2300] started
// Timer [2200] was completed
// Timer [2300] was completed
// Timer [10000] was completed
// Execution finished
```

## Documentation

*Will be soon!*