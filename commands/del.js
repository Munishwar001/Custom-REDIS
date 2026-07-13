const { encode } = require("../redis-parser");
const store = require("../store/store");

function del(connection, command) {
    if (command.length < 2) {
        connection.write(
            encode(new Error("ERR wrong number of arguments for 'DEL' command")),
        );
        return;
    }

    let deletedCount = 0;
    for (let i = 1; i < command.length; i++) {
        if (store.delete(command[i])) {
            deletedCount++;
        }
    }
    connection.write(encode(deletedCount));
}

module.exports = del;
