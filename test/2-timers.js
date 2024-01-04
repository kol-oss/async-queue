"use strict";

const Queue = require("../lib/Queue");
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
