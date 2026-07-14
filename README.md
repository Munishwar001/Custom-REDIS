# redis2.0

A custom Redis server built from scratch in Node.js — implements the RESP
(REdis Serialization Protocol) parser and a small set of commands over raw
TCP, without using any Redis libraries.

## Features

- Hand-written RESP2 parser (decoder + encoder), handling streamed/fragmented
  TCP data and inline (telnet-style) commands.
- Command dispatch for `PING`, `SET`, `GET`, `DEL`, `EXISTS`, `FLUSHDB`, `LPUSH`,
  `RPUSH`, `RPOP`, `LRANGE`, `HSET`, `HGET`, `HGETALL`.
- Shared in-memory key-value store, with values as strings, arrays (lists), or
  plain objects (hashes) — `WRONGTYPE` errors when a command is used against
  the wrong kind of value for a key.
- Error logging to a file (`logs/error.log`) in addition to the console.

## Folder structure

```
index.js              Entry point — starts the TCP server on port 8000
server/
  server.js            net.createServer setup, per-connection RESP decoding,
                        dispatches parsed commands to the command handlers
commands/
  index.js             Dispatch table: command name -> handler
  ping.js
  set.js
  get.js
  del.js
  exists.js
  flushdb.js
  lpush.js
  rpush.js
  rpop.js
  lrange.js
  hset.js
  hget.js
  hgetall.js
store/
  store.js             Shared in-memory Map used by all commands
redis-parser/
  decoder.js            RESPDecoder — parses raw buffers into commands
  encoder.js            encode() and friends — turns JS values into RESP replies
  index.js              Public exports for the parser module
utils/
  logger.js             logError() — writes timestamped errors to logs/error.log
  typeCheck.js         isString/isList/isHash — value-type guards for WRONGTYPE checks
logs/
  error.log             Generated at runtime
```

## Running the server

```
node index.js
```

Starts listening on `127.0.0.1:8000` and logs `Custom Redis Server running on port 8000`.

## Testing it

The easiest way is `redis-cli`, since it speaks proper RESP regardless of
what you type:

```
redis-cli -p 8000
127.0.0.1:8000> ping
PONG
127.0.0.1:8000> set name munishwar
OK
127.0.0.1:8000> get name
"munishwar"
```

Raw inline commands also work via a client that sends CRLF line endings,
e.g. `ncat -C 127.0.0.1 8000` (plain `nc` without `-C` won't work — it only
sends `\n`, not `\r\n`).

## Supported commands

| Command | Usage                | Reply                                        |
|---------|----------------------|-----------------------------------------------|
| PING    | `PING [msg]`         | `PONG`, or echoes `msg` if given               |
| SET     | `SET key value`      | `OK`                                           |
| GET     | `GET key`            | the stored value, or nil if not found          |
| DEL     | `DEL key [key ...]`  | integer count of keys actually deleted         |
| EXISTS  | `EXISTS key [key ...]` | integer count of given keys that exist       |
| FLUSHDB | `FLUSHDB`            | `OK` — removes all keys from the store         |
| LPUSH   | `LPUSH key value [value ...]` | integer length of the list after pushing |
| RPUSH   | `RPUSH key value [value ...]` | integer length of the list after pushing |
| RPOP    | `RPOP key`           | the popped value, or nil if the list/key is empty |
| LRANGE  | `LRANGE key start stop` | array of elements in that range (supports negative indices) |
| HSET    | `HSET key field value [field value ...]` | integer count of fields newly added |
| HGET    | `HGET key field`     | the field's value, or nil if missing           |
| HGETALL | `HGETALL key`        | flattened array `[field, value, field, value, ...]` |

`LPUSH`/`RPUSH`/`LRANGE` error with `WRONGTYPE` if `key` already holds a
string; `HSET`/`HGET`/`HGETALL` do the same for lists. Popping the last
element of a list removes the key entirely, same as real Redis.

Any other command falls back to replying `OK`.

## Known limitations

- Data is in-memory only — nothing is persisted to disk, so a restart wipes
  the store.
- No expiry (`EX`/`PX`).
- Lists are missing `LPOP`/`LLEN`; hashes are missing `HDEL`/`HEXISTS`/`HLEN`.
  No sets or sorted sets yet.
- No authentication.
- This is a learning project, not intended for production use.
