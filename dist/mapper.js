"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.metadata = metadata;
exports.body = body;

function mapType({
  type
}) {
  const types = {
    "s": ["Success Login", 1],
    "seacft": ["Success Exchange", 1],
    "feacft": ["Failed Exchange", 3],
    "f": ["Failed Login", 3],
    "w": ["Warnings During Login", 2],
    "du": ["Deleted User", 1],
    "fu": ["Failed Login (invalid email/username)", 3],
    "fp": ["Failed Login (wrong password)", 3],
    "fc": ["Failed by Connector", 3],
    "fcp": ["Failed by CORS", 3],
    "con": ["Connector Online", 1],
    "coff": ["Connector Offline", 3],
    "fcpro": ["Failed Connector Provisioning", 4],
    "ss": ["Success Signup", 1],
    "fs": ["Failed Signup", 3],
    "cs": ["Code Sent", 0],
    "cls": ["Code/Link Sent", 0],
    "sv": ["Success Verification Email", 0],
    "fv": ["Failed Verification Email", 0],
    "scp": ["Success Change Password", 1],
    "fcp": ["Failed Change Password", 3],
    "sce": ["Success Change Email", 1],
    "fce": ["Failed Change Email", 3],
    "scu": ["Success Change Username", 1],
    "fcu": ["Failed Chagne Username", 3],
    "scpn": ["Success Change Phone Number", 1],
    "fcpn": ["Failed Change Phone Number", 3],
    "svr": ["Success Verification Email Request", 0],
    "fvr": ["Failed Verification Email Request", 3],
    "scpr": ["Success Change Password Request", 0],
    "fcpr": ["Failed Change Password Request", 3],
    "fn": ["Failed Sending Notification", 3],
    "limit_wc": ["Blocked Account", 4],
    "limit_ui": ["Too Many Calls to /userinfo", 4],
    "api_limit": ["Rate Limit on API", 4],
    "sdu": ["Successful User Deletion", 1],
    "fdu": ["Failed User Deletion", 3],
    "depnote": ["Deprecation Notice", 300],
    "sapi": ["API Operation", 0],
    "slo": ["Success Logout", 1],
    "seccft": ["Success Exchange", 1]
  };
  return types[type] || [`No mapping found for: ${type}`, 4];
}

function mapSeverity(log) {
  const [type, level] = mapType(log);

  if (level > 99) {
    return level;
  } // some types are mapped directly to Cloud Logging
  // severity levels
  // DEFAULT	(0) The log entry has no assigned severity level.
  // DEBUG	(100) Debug or trace information.
  // INFO	(200) Routine information, such as ongoing status or performance.
  // NOTICE	(300) Normal but significant events, such as start up, shut down, or a configuration change.
  // WARNING	(400) Warning events might cause problems.
  // ERROR	(500) Error events are likely to cause problems.
  // CRITICAL	(600) Critical events cause more severe problems or outages.
  // ALERT	(700) A person must take an action immediately.
  // EMERGENCY	(800) One or more systems are unusable.


  switch (level) {
    case 0:
      return "DEFAULT";

    case 1:
      return "DEBUG";

    case 2:
      return "INFO";

    case 3:
      return "ERROR";

    case 4:
      return "CRITICAL";
    // or "ALERT"
  }
}

function metadata({
  location,
  nodeId,
  namespace
}, log) {
  return {
    resource: {
      type: 'generic_node',
      labels: {
        location: location,
        namespace: namespace,
        node_id: nodeId
      }
    },
    severity: mapSeverity(log),
    timestamp: new Date(log.date),
    insertId: log["_id"],
    labels: {
      type: mapType(log)[0],
      client: log.client_name
    }
  };
}

function body(log) {
  return {
    client_id: log.client_id,
    client_name: log.client_name,
    connection: log.connection,
    connection_id: log.connection_id,
    hostname: log.hostname,
    description: log.description,
    details: log.details,
    strategy: log.strategy,
    strategy_type: log.strategy_type,
    user_agent: log.user_agent,
    user_id: log.user_id,
    user_name: log.user_name,
    ip: log.ip,
    _original: log
  };
}
//# sourceMappingURL=mapper.js.map