"use strict";

const crypto = require("node:crypto");
const AsyncObject = require("./AsyncObject");

class Queue {
    constructor(streams = 4, options) {
        const {
            paused = true,
        } = options;

        this.streams = streams;
        this.paused = paused;

        this.time = undefined;
        this.onSuccess = null;
        this.onFail = null;
        this.finished = false;

        this.proccessed = new Map();
        this.waiting = [];
    }

    push(fn, ...args) {
        if (this.finished) throw new Error("Queue is finished");

        const task = new AsyncObject(fn, ...args);
        this.waiting.push(task);

        if (!this.paused) this.#execute();
        return this;
    }

    #handle(uuid, task) {
        task
            .execute()
            .then(({ data, args }) => {
                //this.#log(`Task completed with result:`, "success");
                this.onSuccess(data, args)
            })
            .catch((error) => {
                //this.#log(`Task failed with error:`, "error");
                this.onFail(error)
            })
            .finally(() => {
                this.proccessed.delete(uuid);

                this.#execute();
            });
    }

    #shift() {
        const task = this.waiting.shift();

        const uuid = crypto.randomUUID();
        this.proccessed.set(uuid, task);

        //this.#log(`Starting next task...`, "process");

        this.#handle(uuid, task);
        this.#execute();
    }

    #execute() {
        if (this.paused) return;

        const freeStreams = this.streams - this.proccessed.size;
        if (!freeStreams || !this.waiting.length) return;

        this.#shift();
    }

    timeout(ms) {
        this.time = ms;

        if (!this.paused) this.#setTimeout();

        return this;
    }

    success(callback) {
        this.onSuccess = callback;
        return this;
    }

    fail(callback) {
        this.onFail = callback;
        return this;
    }

    resume() {
        if (!this.paused) return this;

        this.paused = false;

        if (this.time) this.#setTimeout();

        this.#execute();
        return this;
    }

    pause() {
        if (this.paused) return;
        this.paused = true;

        for (const [uuid, task] of this.proccessed.entries()) {
            task.abort();
            task.controller = new AbortController();

            this.proccessed.delete(uuid)
            this.waiting.unshift(task);
        }

        return this;
    }

    #setTimeout() {
        setTimeout(() => {
            //this.#log("Timer expired", "error");
            this.finished = true;
            this.pause();
        }, this.time);
    }
}

module.exports = Queue;