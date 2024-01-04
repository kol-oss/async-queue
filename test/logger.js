"use strict";

const COLORS = {
    default: "\x1b[37m",
    reset: "\x1b[0m",
    process: "\x1b[35m",
    success: "\x1b[32m",
    error: "\x1b[31m",
};

function log(message, type = "default", prefix) {
    const fullMessage = prefix ? prefix + " " : ""  + message;
    const color = COLORS[type];

    console.log(color + fullMessage + COLORS.reset);
}

module.exports = {
    log
};
