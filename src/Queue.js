"use strict";

const {COLORS} = require("./config");

class Queue {
    constructor(streams, paused = true) {
        this.active = 0;
        this.streams = streams;
        this.time = undefined;
        this.paused = paused;
        this.proccessed = new Map();
        this.waiting = [];
        this.onSuccess = this.#log;
        this.onFail = this.#log;
        this.finished = false;
    }

    push(task) {
        if (this.finished) throw new Error("Queue is finished");

        this.waiting.push(task);

        if (!this.paused) this.#execute();
        return this;
    }

    #handle(uuid, task) {
        task
            .execute()
            .then((data) => {
                this.#log(`Task completed with result:`, "success");
                this.onSuccess(data)
            })
            .catch((error) => {
                this.#log(`Task failed with error:`, "error");
                this.onFail(error)
            })
            .finally(() => {
                this.proccessed.delete(uuid);
                this.active--;

                this.#execute();
            });
    }

    #shift() {
        const task = this.waiting.shift();

        const uuid = Math.random();
        this.proccessed.set(uuid, task);
        this.active++;

        this.#log(`Starting next task...`, "process");

        this.#handle(uuid, task);
        this.#execute();
    }

    #execute() {
        if (this.paused) return;

        const freeStreams = this.streams - this.active;
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
            this.#log("Timer expired", "error");
            this.finished = true;
            this.pause();
        }, this.time);
    }

    #log(message, type = "default") {
        const prefix = `[Q]`;

        const fullMessage = `${prefix} ${message}`
        const color = COLORS[type];

        console.log(color + fullMessage + COLORS.reset);
    }
}

module.exports = Queue;