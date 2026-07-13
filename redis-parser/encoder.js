class SimpleString {
  constructor(str) {
    this.str = str;
  }
}

function encodeSimpleString(str) {
  return Buffer.from(`+${str}\r\n`, 'utf8');
}

function encodeError(message) {
  return Buffer.from(`-${message}\r\n`, 'utf8');
}

function encodeInteger(num) {
  return Buffer.from(`:${num}\r\n`, 'utf8');
}

function encodeBulkString(str) {
  const data = Buffer.from(str, 'utf8');
  return Buffer.concat([
    Buffer.from(`$${data.length}\r\n`, 'utf8'),
    data,
    Buffer.from('\r\n', 'utf8'),
  ]);
}

function encodeNullBulkString() {
  return Buffer.from('$-1\r\n', 'utf8');
}

function encodeNullArray() {
  return Buffer.from('*-1\r\n', 'utf8');
}

function encodeArray(values) {
  const parts = [Buffer.from(`*${values.length}\r\n`, 'utf8')];
  for (const value of values) {
    parts.push(encode(value));
  }
  return Buffer.concat(parts);
}

function encode(value) {
  if (value === null || value === undefined) return encodeNullBulkString();
  if (value instanceof SimpleString) return encodeSimpleString(value.str);
  if (value instanceof Error) return encodeError(value.message);
  if (typeof value === 'number' && Number.isInteger(value)) return encodeInteger(value);
  if (typeof value === 'string') return encodeBulkString(value);
  if (Array.isArray(value)) return encodeArray(value);
  throw new TypeError(`Cannot encode value of type ${typeof value}`);
}

module.exports = {
  SimpleString,
  encode,
  encodeSimpleString,
  encodeError,
  encodeInteger,
  encodeBulkString,
  encodeNullBulkString,
  encodeNullArray,
  encodeArray,
};
