function isDebugEnabled() {
  const raw = process.env.BIN_HOME_DEBUG;
  if (!raw) {
    return false;
  }
  const value = String(raw).trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes" || value === "on";
}

function safeStringify(meta) {
  if (meta === undefined) {
    return "";
  }
  try {
    return ` ${JSON.stringify(meta)}`;
  } catch (error) {
    return ` ${String(meta)}`;
  }
}

function debugLog(scope, message, meta) {
  if (!isDebugEnabled()) {
    return;
  }
  const prefix = `[bin-home:debug][${scope}]`;
  process.stderr.write(`${prefix} ${message}${safeStringify(meta)}\n`);
}

module.exports = {
  isDebugEnabled,
  debugLog
};
