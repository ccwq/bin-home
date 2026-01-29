const { exec } = require("child_process");
const readline = require("readline");

const NPM_VIEW_EXIT_CODE = 5;
const NPM_UPDATE_EXIT_CODE = 6;

function getNpmCommand() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function normalizeVersions(raw) {
  if (!raw) {
    return [];
  }

  if (Array.isArray(raw)) {
    return raw.filter(Boolean);
  }

  const text = String(raw).trim();
  if (!text) {
    return [];
  }

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed.filter(Boolean);
    }
  } catch (error) {
    // Fall through for non-JSON outputs.
  }

  return text
    .replace(/[\[\]]/g, "")
    .split(/[\s,]+/)
    .filter(Boolean);
}

function sortNewestFirst(versions) {
  if (!versions.length) {
    return [];
  }

  const sorted = versions.slice();
  sorted.reverse();
  return sorted;
}

function execCommand(command, execFn, exitCode, errorMessage) {
  return new Promise((resolve, reject) => {
    execFn(
      command,
      { maxBuffer: 10 * 1024 * 1024, windowsHide: true },
      (error, stdout) => {
        if (error) {
          const err = new Error(`${errorMessage}: ${error.message}`);
          err.exitCode = exitCode;
          return reject(err);
        }
        resolve(stdout);
      }
    );
  });
}

async function fetchOnlineVersions(packageName, options = {}) {
  if (options.versionsOverride) {
    const versions = normalizeVersions(options.versionsOverride);
    return sortNewestFirst(versions).slice(0, options.limit || 6);
  }

  if (process.env.BIN_HOME_TEST_VERSIONS) {
    const versions = normalizeVersions(process.env.BIN_HOME_TEST_VERSIONS);
    return sortNewestFirst(versions).slice(0, options.limit || 6);
  }

  const npmCommand = getNpmCommand();
  const command = `${npmCommand} view ${packageName} versions --json`;
  if (typeof options.onLoading === "function") {
    options.onLoading();
  }
  const stdout = await execCommand(
    command,
    options.execFn || exec,
    NPM_VIEW_EXIT_CODE,
    `Failed to fetch npm versions for ${packageName}`
  );
  const versions = normalizeVersions(stdout);
  return sortNewestFirst(versions).slice(0, options.limit || 6);
}

function formatVersionOutput(localVersion, versions) {
  const list = Array.isArray(versions) ? versions : [];
  return `当前版本: ${localVersion}\n线上版本: ${list.join(",")}`;
}

function isInteractiveSession(options = {}) {
  const input = options.input || process.stdin;
  const output = options.output || process.stdout;
  return Boolean(input && output && input.isTTY && output.isTTY);
}

function promptForVersion(options = {}) {
  const input = options.input || process.stdin;
  const output = options.output || process.stdout;
  const defaultVersion = options.defaultVersion || "latest";

  return new Promise((resolve) => {
    const rl = readline.createInterface({ input, output });
    rl.question(`请输入要更新的版本 (默认 ${defaultVersion}): `, (answer) => {
      rl.close();
      const trimmed = answer.trim();
      resolve(trimmed || defaultVersion);
    });
  });
}

async function selectVersionWithInquirer(versions, options = {}) {
  const input = options.input || process.stdin;
  const output = options.output || process.stdout;
  const defaultVersion = options.defaultVersion || "latest";
  const choices = [defaultVersion, ...versions].map((value) => ({
    name: value,
    value
  }));

  const { select } = await import("@inquirer/prompts");

  try {
    return await select(
      {
        message: "请选择要更新的版本（上下方向键选择，回车确认，Esc 取消）：",
        choices,
        default: defaultVersion,
        pageSize: Math.min(Math.max(choices.length, 1), 10)
      },
      { input, output }
    );
  } catch (error) {
    if (error && (error.name === "AbortPromptError" || error.name === "ExitPromptError")) {
      return null;
    }
    if (error && error.isTtyError) {
      return promptForVersion(options);
    }
    throw error;
  }
}

async function chooseTargetVersion(versions, options = {}) {
  if (options.interactive === false) {
    return promptForVersion(options);
  }

  if (options.interactive === true || isInteractiveSession(options)) {
    return selectVersionWithInquirer(versions, options);
  }

  return promptForVersion(options);
}

async function runGlobalUpdate(packageName, version, options = {}) {
  const npmCommand = getNpmCommand();
  const command = `${npmCommand} i -g ${packageName}@${version}`;
  return execCommand(
    command,
    options.execFn || exec,
    NPM_UPDATE_EXIT_CODE,
    `Failed to update ${packageName}`
  );
}

module.exports = {
  fetchOnlineVersions,
  formatVersionOutput,
  chooseTargetVersion,
  promptForVersion,
  runGlobalUpdate
};
