const { encode } = require("../redis-parser");
const store = require("../store/store");
const { isHash } = require("../utils/typeCheck");

function hgetall(connection, command) {
    if (command.length !== 2) {
        connection.write(
            encode(new Error("ERR wrong number of arguments for 'HGETALL' command")),
        );
        return;
    }

    const key = command[1];
    const existing = store.get(key);

    if (existing === undefined) {
        connection.write(encode([]));
        return;
    }

    if (!isHash(existing)) {
        connection.write(
            encode(
                new Error(
                    "WRONGTYPE Operation against a key holding the wrong kind of value",
                ),
            ),
        );
        return;
    }

    const reply = [];
    for (const field of Object.keys(existing)) {
        reply.push(field, existing[field]);
    }

    connection.write(encode(reply));
}

module.exports = hgetall;
