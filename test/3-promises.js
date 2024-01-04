"use strict";

const { log } = require("./logger");

const Queue = require("../src/Queue");

// Set max concurrent streams: 2
// Paused from the beginning
const queue = new Queue(2);

// Set listeners callbacks
queue
    .onResume(() => log("Execution started", "process"))
    .onSuccess((data, args) => {
        log(`URL ${args} parsed:`, "success");
        log(data);
    })
    .onFail((error) => log(error, "error"))
    .onComplete(() => log("Execution finished", "process"));

// Set execution time limit
queue
    .timeout(500)
    .onTimeout(() => log("Timed out", "error"));

// Add urls to read
queue
    .push(fetch, "https://quran.com/")
    .push(fetch, "https://github.com/kol-oss")
    .push(fetch, "https://www.youtube.com/watch?v=KgRRb0vk0Gw&feature=youtu.be");

// Start concurrent execution
queue
    .resume();
