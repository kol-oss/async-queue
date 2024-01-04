"use strict";

const Queue = require("../src/Queue");

const timeout = (ms, callback) => setTimeout(callback, ms);

const queue = new Queue(2, {
    paused: false
});

queue
    .push(timeout, 200)
    .push(timeout, 900)
    .push(timeout, 15000)
    .push(timeout, 300)
    .timeout(1000)
    .success((data, args) => {
        if (data) console.log(data);

        console.log(`Timer with time ${args} expired`)
    })
    .complete(() => console.log("Execution finished"))
