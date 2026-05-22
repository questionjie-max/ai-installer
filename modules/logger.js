/**
 * Simple logger for AI Installer
 * Writes logs to ~/.ai-installer/install.log
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const LOG_DIR = path.join(os.homedir(), '.ai-installer');
const LOG_FILE = path.join(LOG_DIR, 'install.log');

function ensureDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function timestamp() {
  return new Date().toISOString();
}

function log(level, tag, message, data = null) {
  ensureDir();
  const prefix = `[${timestamp()}] [${level}] [${tag}]`;
  const line = data
    ? `${prefix} ${message} ${JSON.stringify(data)}`
    : `${prefix} ${message}`;
  fs.appendFileSync(LOG_FILE, line + '\n');
  return line;
}

const logger = {
  info: (tag, msg, data) => log('INFO', tag, msg, data),
  warn: (tag, msg, data) => log('WARN', tag, msg, data),
  error: (tag, msg, data) => log('ERROR', tag, msg, data),
  debug: (tag, msg, data) => log('DEBUG', tag, msg, data),

  getLogPath: () => LOG_FILE,

  readLogs: (lines = 50) => {
    try {
      if (!fs.existsSync(LOG_FILE)) return [];
      const content = fs.readFileSync(LOG_FILE, 'utf-8');
      const allLines = content.trim().split('\n');
      return allLines.slice(-lines);
    } catch {
      return [];
    }
  },

  clear: () => {
    ensureDir();
    fs.writeFileSync(LOG_FILE, '');
  }
};

module.exports = logger;
