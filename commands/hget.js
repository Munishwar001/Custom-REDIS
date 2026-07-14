const { encode } = require("../redis-parser");
const store = require("../store/store");
const { isHash } = require("../utils/typeCheck");

function hget(connection, command) {
    if (command.length !== 3) {
        connection.write(
            encode(new Error("ERR wrong number of arguments for 'HGET' command")),
        );
        return;
    }

    const key = command[1];
    const field = command[2];
    const existing = store.get(key);

    if (existing === undefined) {
        connection.write(encode(null));
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

    if (!Object.prototype.hasOwnProperty.call(existing, field)) {
        connection.write(encode(null));
        return;
    }

    connection.write(encode(existing[field]));
}

module.exports = hget;
