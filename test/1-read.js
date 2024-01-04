"use strict";

const fs = require("node:fs");

const Queue = require("../src/Queue");

const queue = new Queue(3, { paused: true });

queue
    .push(fs.readFile, "./resources/light.txt", "utf-8")
    .push(fs.readFile, "./resources/heavy.txt", "utf-8")
    .success((data) => console.log(data))
    .complete(() => console.log("completed"));

queue
    .resume();
