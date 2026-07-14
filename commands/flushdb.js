const { SimpleString, encode } = require("../redis-parser");
const store = require("../store/store");

function flushdb(connection, command) {
    if (command.length !== 1) {
        connection.write(
            encode(new Error("ERR wrong number of arguments for 'FLUSHDB' command")),
        );
        return;
    }

    store.clear();
    connection.write(encode(new SimpleString("OK")));
}

module.exports = flushdb;
