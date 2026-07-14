const { encode } = require("../redis-parser");
const store = require("../store/store");
const { isList } = require("../utils/typeCheck");

function lpush(connection, command) {
    if (command.length < 3) {
        connection.write(
            encode(new Error("ERR wrong number of arguments for 'LPUSH' command")),
        );
        return;
    }

    const key = command[1];
    const existing = store.get(key);

    if (existing !== undefined && !isList(existing)) {
        connection.write(
            encode(
                new Error(
                    "WRONGTYPE Operation against a key holding the wrong kind of value",
                ),
            ),
        );
        return;
    }

    const list = existing !== undefined ? existing : [];
    for (let i = 2; i < command.length; i++) {
        list.unshift(command[i]);
    }

    store.set(key, list);
    connection.write(encode(list.length));
}

module.exports = lpush;
