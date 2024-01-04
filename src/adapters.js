"use strict";

const callbackify = (fn) => (...args) => {
    const callback = args.pop();
    const promise = fn(...args);

    promise
        .then((data) => {
            callback(null, data);
        })
        .catch((err) => {
            callback(err);
        });
};

module.exports = {
    callbackify
}