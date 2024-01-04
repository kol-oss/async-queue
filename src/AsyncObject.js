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

class AsyncObject {
    constructor(fn, ...args) {
        this.fn = (fn[Symbol.toStringTag] === 'AsyncFunction') ? callbackify(fn) : fn;
        this.args = args;
        this.finished = false;
        this.controller = new AbortController();
    }

    execute() {
        return new Promise((resolve, reject) => {
            const {signal} = this.controller;
            if (signal.aborted) {
                reject(new Error("Operation is aborted..."));
            }

            this.fn(...this.args, (err, data) => {
                if (err) reject(err);

                this.controller = new AbortController();
                this.finished = true;
                resolve({data, args: this.args});
            });

            signal.addEventListener("abort", () => {
                reject(new Error("Operation is aborted..."));
            });
        })
    }

    abort() {
        const {signal} = this.controller;
        if (signal.aborted) return;

        if (!this.finished) this.controller.abort();
    }
}

module.exports = AsyncObject;
