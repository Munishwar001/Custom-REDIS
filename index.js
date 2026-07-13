const net = require('net');
const { RESPDecoder, RESPParseError, SimpleString, encode } = require('./redis-parser');
const { logError } = require('./logger');

const server = net.createServer((connection) => {
  console.log('Client connected');
  const decoder = new RESPDecoder();

  connection.on('data', (data) => {
    let commands;
    try {
      commands = decoder.push(data);
    } catch (err) {
      if (err instanceof RESPParseError) {
        logError(`Protocol error: ${err.message}`);
        connection.write(encode(new Error(`ERR Protocol error: ${err.message}`)));
        connection.end();
        return;
      }
      throw err;
    }

    for (const command of commands) {
      console.log('Received command:', command);
      connection.write(encode(new SimpleString('OK')));
    }
  });

  connection.on('close', () => {
    console.log('Client disconnected');
  });

  connection.on('error', (err) => {
    logError(`Connection error: ${err.message}`);
  });
});

server.on('error', (err) => {
  logError(`Server error: ${err.message}`);
});

server.listen(8000, () => {
  console.log('Custom Redis Server running on port 8000');
});