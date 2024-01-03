"use strict";

class AsyncObject {
    constructor(fn, ...args)  {
        this.fn = fn;
        this.args = args;
        this.finished = false;
        this.controller = new AbortController();
    }

    static set(fn) {
        return (...args) => new AsyncObject(fn, ...args);
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
                resolve(data);
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
