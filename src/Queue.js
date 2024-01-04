"use strict";

const crypto = require("node:crypto");
const EventEmitter = require("node:events");

const AsyncObject = require("./AsyncObject");

class Queue {
    constructor(streams = 4, options) {
        const {
            paused = true,
        } = options;

        this.events = new EventEmitter();
        this.streams = streams;
        this.paused = paused;

        this.time = undefined;
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
                this.events.emit("success", data, args);
            })
            .catch((error) => {
                this.events.emit("fail", error);
            })
            .finally(() => {
                this.proccessed.delete(uuid);

                if (this.waiting.length === 0 && this.proccessed.size === 0) {
                    this.events.emit("complete");
                    return;
                }
                this.#execute();
            });

        this.#execute();
    }

    #shift() {
        const task = this.waiting.shift();

        const uuid = crypto.randomUUID();
        this.proccessed.set(uuid, task);

        this.#handle(uuid, task);
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
        this.events.on("success", callback);
        return this;
    }

    fail(callback) {
        this.events.on("fail", callback);
        return this;
    }

    resume() {
        if (!this.paused) return this;

        this.paused = false;
        this.events.emit("resume");

        if (this.time) this.#setTimeout();

        this.#execute();
        return this;
    }

    pause() {
        if (this.paused) return;

        this.paused = true;
        this.events.emit("pause");

        for (const [uuid, task] of this.proccessed.entries()) {
            task.abort();
            task.controller = new AbortController();

            this.proccessed.delete(uuid);
            this.waiting.unshift(task);
        }

        return this;
    }

    complete(callback) {
        this.events.on("complete", callback);
        return this;
    }

    onPause(callback) {
        this.events.on("pause", callback);
        return this;
    }

    onResume(callback) {
        this.events.on("resume", callback);
        return this;
    }

    #setTimeout() {
        setTimeout(() => {
            this.finished = true;
            this.pause();
            this.events.emit("complete");
        }, this.time);
    }
}

module.exports = Queue;
