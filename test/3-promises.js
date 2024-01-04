"use strict";

const fs = require("node:fs");

const Queue = require("../src/Queue");

const queue = new Queue(2, { paused: false });

queue
    .push(fs.promises.readFile, "./resources/light.txt", "utf-8")
    .push(fs.readFile, "./resources/heavy.txt", "utf-8")
    .success((data) => console.log(data));
