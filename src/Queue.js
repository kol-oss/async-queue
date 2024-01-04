"use strict";

const crypto = require("node:crypto");
const EventEmitter = require("node:events");

const AsyncObject = require("./AsyncObject");

class Queue {
    constructor(streams = 4, options = { paused: true }) {
        const {
            paused
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
        const timer = this.#setAbortion(task);

        this.events.emit("execute", task.args);
        task
            .execute()
            .then(({ data, args }) => {
                this.events.emit("success", data, args);
            })
            .catch((error) => {
                this.events.emit("fail", error);
            })
            .finally(() => {
                clearTimeout(timer);
                this.proccessed.delete(uuid);

                if (this.waiting.length === 0 && this.proccessed.size === 0) {
                    this.events.emit("complete");
                    return;
                }
                this.#execute();
            });

        this.#execute();
    }

    #setAbortion(task) {
        if (!this.time) return;

        return setTimeout(() => {
            this.events.emit("timeout");
            task.abort();
        }, this.time);
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

        return this;
    }

    resume() {
        if (!this.paused) return this;

        this.paused = false;
        this.events.emit("resume");

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

    onSuccess(callback) {
        this.events.on("success", callback);
        return this;
    }

    onFail(callback) {
        this.events.on("fail", callback);
        return this;
    }

    onComplete(callback) {
        this.events.on("complete", callback);
        return this;
    }

    onExecute(callback) {
        this.events.on("execute", callback);
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

    onTimeout(callback) {
        this.events.on("timeout", callback);
        return this;
    }
}

module.exports = Queue;
