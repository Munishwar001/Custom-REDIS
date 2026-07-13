const TYPE = {
  SIMPLE_STRING: 0x2b, // '+'
  ERROR: 0x2d, // '-'
  INTEGER: 0x3a, // ':'
  BULK_STRING: 0x24, // '$'
  ARRAY: 0x2a, // '*'
};

class RESPParseError extends Error {}

// Reads a CRLF-terminated line starting right after the type byte at `offset`.
// Returns null (not an error) when the line hasn't fully arrived yet, so the
// caller can wait for more data instead of failing on a partial chunk.
function readLine(buf, offset) {
  const idx = buf.indexOf('\r\n', offset, 'latin1');
  if (idx === -1) return null;
  return { line: buf.toString('utf8', offset, idx), next: idx + 2 };
}

function parseSimpleString(buf, offset) {
  const line = readLine(buf, offset + 1);
  if (!line) return null;
  return { value: line.line, offset: line.next };
}

function parseError(buf, offset) {
  const line = readLine(buf, offset + 1);
  if (!line) return null;
  return { value: new Error(line.line), offset: line.next };
}

function parseInteger(buf, offset) {
  const line = readLine(buf, offset + 1);
  if (!line) return null;
  const num = Number.parseInt(line.line, 10);
  if (Number.isNaN(num)) throw new RESPParseError(`Invalid integer: ${line.line}`);
  return { value: num, offset: line.next };
}

function parseBulkString(buf, offset) {
  const line = readLine(buf, offset + 1);
  if (!line) return null;
  const len = Number.parseInt(line.line, 10);
  if (Number.isNaN(len)) throw new RESPParseError(`Invalid bulk string length: ${line.line}`);
  if (len === -1) return { value: null, offset: line.next };

  const dataStart = line.next;
  const dataEnd = dataStart + len;
  if (buf.length < dataEnd + 2) return null;
  if (buf[dataEnd] !== 0x0d || buf[dataEnd + 1] !== 0x0a) {
    throw new RESPParseError('Bulk string missing trailing CRLF');
  }
  return { value: buf.toString('utf8', dataStart, dataEnd), offset: dataEnd + 2 };
}

function parseArray(buf, offset) {
  const line = readLine(buf, offset + 1);
  if (!line) return null;
  const count = Number.parseInt(line.line, 10);
  if (Number.isNaN(count)) throw new RESPParseError(`Invalid array length: ${line.line}`);
  if (count === -1) return { value: null, offset: line.next };

  const items = [];
  let cur = line.next;
  for (let i = 0; i < count; i++) {
    const result = parseValue(buf, cur);
    if (!result) return null;
    items.push(result.value);
    cur = result.offset;
  }
  return { value: items, offset: cur };
}

// Redis also accepts plain space-separated commands with no type prefix
// (used by e.g. `telnet` / `nc`), known as the inline command format.
function parseInline(buf, offset) {
  const line = readLine(buf, offset);
  if (!line) return null;
  const parts = line.line.split(/\s+/).filter(Boolean);
  return { value: parts, offset: line.next };
}

function parseValue(buf, offset) {
  if (offset >= buf.length) return null;
  switch (buf[offset]) {
    case TYPE.SIMPLE_STRING:
      return parseSimpleString(buf, offset);
    case TYPE.ERROR:
      return parseError(buf, offset);
    case TYPE.INTEGER:
      return parseInteger(buf, offset);
    case TYPE.BULK_STRING:
      return parseBulkString(buf, offset);
    case TYPE.ARRAY:
      return parseArray(buf, offset);
    default:
      return parseInline(buf, offset);
  }
}

class RESPDecoder {
  constructor() {
    this._buffer = Buffer.alloc(0);
  }

  // Feed a chunk of raw socket data in; get back every RESP value that
  // completed as a result (zero, one, or many — TCP may coalesce or split
  // commands arbitrarily). Anything incomplete is buffered for next time.
  push(chunk) {
    this._buffer = this._buffer.length ? Buffer.concat([this._buffer, chunk]) : chunk;

    const values = [];
    while (true) {
      let result;
      try {
        result = parseValue(this._buffer, 0);
      } catch (err) {
        this._buffer = Buffer.alloc(0);
        throw err;
      }
      if (!result) break;
      values.push(result.value);
      this._buffer = this._buffer.subarray(result.offset);
    }
    return values;
  }
}

module.exports = {
  RESPDecoder,
  RESPParseError,
  parseValue,
};
