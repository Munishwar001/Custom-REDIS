const { encode } = require("../redis-parser");
const store = require("../store/store");
const { isHash } = require("../utils/typeCheck");

function hset(connection, command) {
    if (command.length < 4 || command.length % 2 !== 0) {
        connection.write(
            encode(new Error("ERR wrong number of arguments for 'HSET' command")),
        );
        return;
    }

    const key = command[1];
    const existing = store.get(key);

    if (existing !== undefined && !isHash(existing)) {
        connection.write(
            encode(
                new Error(
                    "WRONGTYPE Operation against a key holding the wrong kind of value",
                ),
            ),
        );
        return;
    }

    const hash = existing !== undefined ? existing : {};
    let addedCount = 0;

    for (let i = 2; i < command.length; i += 2) {
        const field = command[i];
        const value = command[i + 1];
        if (!Object.prototype.hasOwnProperty.call(hash, field)) {
            addedCount++;
        }
        hash[field] = value;
    }

    store.set(key, hash);
    connection.write(encode(addedCount));
}

module.exports = hset;
