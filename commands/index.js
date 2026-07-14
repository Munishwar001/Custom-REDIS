const { SimpleString, encode } = require("../redis-parser");
const ping = require("./ping");
const set = require("./set");
const get = require("./get");
const del = require("./del");
const exists = require("./exists");
const flushdb = require("./flushdb");

function dispatch(connection, command) {
    switch (command[0].toUpperCase()) {
        case "PING":
            ping(connection, command);
            break;
        case "SET":
            set(connection, command);
            break;
        case "GET":
            get(connection, command);
            break;
        case "DEL":
            del(connection, command);
            break;
        case "EXISTS":
            exists(connection, command);
            break;
        case "FLUSHDB":
            flushdb(connection, command);
            break;
        default:
            connection.write(encode(new SimpleString("OK")));
    }
}

module.exports = dispatch;
