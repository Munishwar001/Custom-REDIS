const { encode } = require("../redis-parser");
const store = require("../store/store");
const { isList } = require("../utils/typeCheck");

function rpop(connection, command) {
    if (command.length !== 2) {
        connection.write(
            encode(new Error("ERR wrong number of arguments for 'RPOP' command")),
        );
        return;
    }

    const key = command[1];
    const existing = store.get(key);

    if (existing === undefined) {
        connection.write(encode(null));
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

    const value = existing.pop();
    if (existing.length === 0) {
        store.delete(key);
    } else {
        store.set(key, existing);
    }

    connection.write(encode(value));
}

module.exports = rpop;
