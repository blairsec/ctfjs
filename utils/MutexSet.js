class MutexSet {
    constructor() {
        this.info = {};
    }

    lock(id) {
        let cur = this.info[id];
        if (id in this.info) {
            cur = this.info[id];
        } else {
            cur = {queue: [], locked: false};
            this.info[id] = cur;
        }
        const {queue, locked} = cur;
        if (!locked) {
            cur.locked = true;
            return Promise.resolve(null);
        }
        return new Promise((res) => {
            queue.push(res);
        });
    }

    unlock(id) {
        const {queue, locked} = this.info[id];
        if (!locked) {
            throw new Error("Cannot unlock mutex with no locks.");
        }
        if (queue.length > 0) {
            queue.shift()();
        } else {
            // remove from storage once no locks to free space
            delete this.info[id];
        }
    }

    async run(id, f) {
        await this.lock(id);
        await f();
        await this.unlock(id);
    }
}

module.exports = MutexSet;
