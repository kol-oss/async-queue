"use strict";

const { callbackify } = require("./adapters");

const isAsync = (fn) => (fn[Symbol.toStringTag] === "AsyncFunction");

class AsyncObject {
    constructor(fn, ...args) {
        this.fn = isAsync(fn) ? callbackify(fn) : fn;
        this.args = args;
        this.finished = false;
        this.controller = new AbortController();
    }

    execute() {
        return new Promise((resolve, reject) => {
            const { signal } = this.controller;
            if (signal.aborted) {
                reject(new Error("Operation is aborted..."));
            }

            const id = this.fn(...this.args, (err, data) => {
                if (err) reject(err);

                this.controller = new AbortController();
                this.finished = true;
                resolve({ data, args: this.args });
            });

            signal.addEventListener("abort", () => {
                if (id) clearTimeout(id);
                reject(new Error("Operation is aborted..."));
            });
        });
    }

    abort() {
        const { signal } = this.controller;
        if (signal.aborted) return;

        if (!this.finished) this.controller.abort();
    }
}

module.exports = AsyncObject;
