"use strict";

const Queue = require("../src/Queue");

const timeout = (ms, callback) => setTimeout(callback, ms);

const queue = new Queue(1);

queue
    .push(timeout, 200)
    .push(timeout, 900)
    .push(timeout, 1100)
    .push(timeout, 300)
    .success((args) => console.log(`Timer with time ${args} expired`))
    .resume();

