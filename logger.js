const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, 'logs');
const ERROR_LOG_FILE = path.join(LOG_DIR, 'error.log');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}

function logError(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  console.error(message);
  fs.appendFile(ERROR_LOG_FILE, line, (err) => {
    if (err) console.error('Failed to write to error log:', err.message);
  });
}

module.exports = { logError };
