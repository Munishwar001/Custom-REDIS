const { encode } = require("../redis-parser");
const store = require("../store/store");

function get(connection, command) {
    if (command.length !== 2) {
        connection.write(
            encode(new Error("ERR wrong number of arguments for 'GET' command")),
        );
    }
    const value = store.get(command[1]);
    if (value === undefined) {
        connection.write(encode(null));
    } else {
        connection.write(encode(value));
    }
}

module.exports = get;
