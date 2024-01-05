"use strict";

const Queue = require("../lib/Queue");
const { log } = require("./logger");

const timeout = (ms, callback) => setTimeout(callback, ms);

// Set max concurrent streams: 2
// Active from the beginning
const queue = new Queue(2, { paused: false });

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
    .push(timeout, 1000);

// Pause after executing one task
setTimeout(() => {
    log("Pausing after 2000 msec...", "process");
    queue.pause();
}, 2000);

// Resume executing
setTimeout(() => {
    log("Resume execution...", "process");
    queue.resume();
}, 3000);
