const { SimpleString, encode } = require("../redis-parser");

function ping(connection, command) {
    if (command.length > 1) {
        connection.write(encode(command[1]));
    } else {
        connection.write(encode(new SimpleString("PONG")));
    }
}

module.exports = ping;
