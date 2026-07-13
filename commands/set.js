const { SimpleString, encode } = require("../redis-parser");
const store = require("../store/store");

function set(connection, command) {
    if (command.length !== 3) {
        connection.write(
            encode(new Error("ERR wrong number of arguments for 'SET' command")),
        );
    }
    store.set(command[1], command[2]);
    connection.write(encode(new SimpleString("OK")));
}

module.exports = set;
