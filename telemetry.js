const fs = require('fs');

const { logger } = require('./logging');

const TELEMETRY_PATH = 'telemetry.log';

const PROCESS_ID = Math.floor(Math.random() * 1e10).toString(16);

let receivedCount = 0;
let telemetry = {};

function count(label) {
  receive(PROCESS_ID, label, 1);
}

function receive(pid, label, count) {
  if (!pid || !label || !count) {
    return;
  }
  if (!telemetry[pid]) {
    telemetry[pid] = {};
  }
  if (!telemetry[pid][label]) {
    telemetry[pid][label] = 0;
  }
  telemetry[pid][label] += count;
  receivedCount++;
}

function write() {
  if (!receivedCount) {
    return;
  }

  logger.info(`Writing ${receivedCount} telemetry records...`);
  telemetry.timestamp = new Date().getTime();
  if (process.env.WRITE_TELEMETRY_TO_CONSOLE) {
    logger.info('Telemetry', JSON.stringify(telemetry));
  } else {
    fs.appendFileSync(TELEMETRY_PATH, JSON.stringify(telemetry) + '\n');
  }
  telemetry = {};
  receivedCount = 0;
}

function send() {
  if (!telemetry[PROCESS_ID]) {
    return;
  }
  const data = {
    pid: PROCESS_ID,
    chartCount: telemetry[PROCESS_ID].chartCount,
    qrCount: telemetry[PROCESS_ID].qrCount,
  };
  try {
    fetch('https://quickchart.io/telemetry', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'content-type': 'application/json',
      },
    });
  } catch (err) {}

  telemetry = {};
}

if (process.env.ENABLE_TELEMETRY_WRITE) {
  logger.info('Telemetry writing is enabled');
  setInterval(
    () => {
      write();
    },
    1000 * 60 * 60 * 1,
  );
}
if (!process.env.DISABLE_TELEMETRY) {
  logger.info('Telemetry is enabled');
  setInterval(
    () => {
      send();
    },
    1000 * 60 * 60 * 12,
  );
}

module.exports = {
  count,
  receive,
  write,
};
