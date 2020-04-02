"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connectLogs = void 0;

var _logging = require("@google-cloud/logging");

var _auth0LogExtensionTools = require("auth0-log-extension-tools");

var _mapper = require("./mapper");

const connectLogs = opts => {
  // Configuration -------------
  const {
    domain,
    clientId,
    clientSecret
  } = opts.auth0 || {};
  const {
    projectId,
    logName,
    location,
    nodeId,
    namespace
  } = opts.google || {
    logName: 'auth0-logs',
    location: 'Europe',
    nodeId: domain,
    namespace: 'auth0'
  };
  const {
    batchSize,
    logger,
    checkpointId
  } = opts.connector || {
    batchSize: 50
  };
  let unsetConfig = [domain, clientId, clientSecret, projectId].filter(config => !(typeof config !== "undefined"));

  if (unsetConfig.length > 0) {
    throw new Error(`Required config not set`);
  } // Setup required objects ----


  const a0stream = new _auth0LogExtensionTools.LogsApiStream({
    domain: domain,
    clientId: clientId,
    clientSecret: clientSecret,
    checkpointId: checkpointId,
    logger: logger
  });
  const logging = new _logging.Logging({
    projectId
  });
  const log = logging.log(logName); // Run ----------------

  return new Promise((resolve, reject) => {
    let lastCheckpointId = checkpointId;
    let logsProcessed = 0;
    let lastLimits = {}; // Operations ----------------

    const writeLog = line => {
      const entry = log.entry((0, _mapper.metadata)({
        location,
        nodeId,
        namespace
      }, line), (0, _mapper.body)(line));
      log.write(entry);
    };

    const handleBatch = ({
      logs,
      limits
    }) => {
      logs.map(writeLog); // Save in case this was the last batch

      const lastLog = logs[logs.length - 1];
      logsProcessed += logs.length;
      lastCheckpointId = lastLog ? lastLog["_id"] : lastCheckpointId;
      lastLimits = limits;
      next();
    };

    const handleEnd = () => {
      if (logger) {
        logger.debug('No more logs to write');
      }

      resolve({
        checkpointId: lastCheckpointId,
        logsProcessed: logsProcessed,
        limits: lastLimits
      });
    };

    const handleError = err => {
      if (logger) {
        logger.error(`Error while fetching logs: ${err}`);
      }

      reject(err);
    };

    const next = () => {
      if (logger) {
        logger.debug(`Fetching another ${batchSize}...`);
      }

      a0stream.next(batchSize);
    };

    a0stream.on('data', handleBatch);
    a0stream.on('end', handleEnd);
    a0stream.on('error', handleError);
    next();
  });
};

exports.connectLogs = connectLogs;
//# sourceMappingURL=index.js.map