"use strict";

const fs = require("node:fs");

const Queue = require("../lib/Queue");
const { log } = require("./logger");

// Set max concurrent streams: 2
// Paused from the beginning
const queue = new Queue(2, { paused: true });

// Set max execution time: 1000
const ms = 1000;
queue
    .timeout(ms)
    .onTimeout(() => log(`Task wasn't completed in ${ms}`, "error"));

// Set listeners callbacks
queue
    .onResume(() => log("Execution started", "process"))
    .onSuccess((data, args) => {
        log(`Task with args ${args} was completed:`, "success");
        log(data);
    })
    .onFail((error) => log(error, "error"))
    .onComplete(() => log("Execution finished", "process"));

// Add callbacks to execute
queue
    .push(fs.readFile, "./resources/light.txt", "utf-8")
    .push(fs.readFile, "./resources/heavy.txt", "utf-8")
    .push(fs.readFile, "./resources/light.txt", "utf-8")
    .push(fs.readFile, "./resources/light.txt", "utf-8");

// Start concurrent execution
queue
    .resume();
