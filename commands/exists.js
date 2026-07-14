const { encode } = require("../redis-parser");
const store = require("../store/store");

function exists(connection, command) {
    if (command.length < 2) {
        connection.write(
            encode(new Error("ERR wrong number of arguments for 'EXISTS' command")),
        );
        return;
    }

    let count = 0;
    for (let i = 1; i < command.length; i++) {
        if (store.has(command[i])) {
            count++;
        }
    }
    connection.write(encode(count));
}

module.exports = exists;
