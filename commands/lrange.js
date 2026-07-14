const { encode } = require("../redis-parser");
const store = require("../store/store");
const { isList } = require("../utils/typeCheck");

function lrange(connection, command) {
    if (command.length !== 4) {
        connection.write(
            encode(new Error("ERR wrong number of arguments for 'LRANGE' command")),
        );
        return;
    }

    const key = command[1];
    const start = Number.parseInt(command[2], 10);
    const stop = Number.parseInt(command[3], 10);

    if (Number.isNaN(start) || Number.isNaN(stop)) {
        connection.write(encode(new Error("ERR value is not an integer or out of range")));
        return;
    }

    const existing = store.get(key);

    if (existing === undefined) {
        connection.write(encode([]));
        return;
    }

    if (!isList(existing)) {
        connection.write(
            encode(
                new Error(
                    "WRONGTYPE Operation against a key holding the wrong kind of value",
                ),
            ),
        );
        return;
    }

    const length = existing.length;
    let from = start < 0 ? Math.max(length + start, 0) : start;
    let to = stop < 0 ? length + stop : Math.min(stop, length - 1);

    if (from > to || from >= length) {
        connection.write(encode([]));
        return;
    }

    connection.write(encode(existing.slice(from, to + 1)));
}

module.exports = lrange;
