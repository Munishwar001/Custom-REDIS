const { SimpleString, encode } = require("../redis-parser");
const ping = require("./ping");
const set = require("./set");
const get = require("./get");
const del = require("./del");
const exists = require("./exists");
const flushdb = require("./flushdb");
const lpush = require("./lpush");
const rpush = require("./rpush");
const rpop = require("./rpop");
const lrange = require("./lrange");
const hset = require("./hset");
const hget = require("./hget");
const hgetall = require("./hgetall");

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
        case "LPUSH":
            lpush(connection, command);
            break;
        case "RPUSH":
            rpush(connection, command);
            break;
        case "RPOP":
            rpop(connection, command);
            break;
        case "LRANGE":
            lrange(connection, command);
            break;
        case "HSET":
            hset(connection, command);
            break;
        case "HGET":
            hget(connection, command);
            break;
        case "HGETALL":
            hgetall(connection, command);
            break;
        default:
            connection.write(encode(new SimpleString("OK")));
    }
}

module.exports = dispatch;
