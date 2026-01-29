const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { execFile } = require("node:child_process");

const cliPath = path.join(__dirname, "..", "bin", "cli.js");
const binuPath = path.join(__dirname, "..", "bin", "binu.js");
const packageJson = require("../package.json");

function runCli(args, options = {}) {
  return new Promise((resolve, reject) => {
    const env = { ...process.env, ...(options.env || {}) };
    execFile(
      process.execPath,
      [cliPath, ...args],
      { env },
      (error, stdout, stderr) => {
        if (error) {
          error.stdout = stdout;
          error.stderr = stderr;
          return reject(error);
        }
        resolve({ stdout, stderr });
      }
    );
  });
}

function runBinu(args, options = {}) {
  return new Promise((resolve, reject) => {
    const env = { ...process.env, ...(options.env || {}) };
    execFile(
      process.execPath,
      [binuPath, ...args],
      { env },
      (error, stdout, stderr) => {
        if (error) {
          error.stdout = stdout;
          error.stderr = stderr;
          return reject(error);
        }
        resolve({ stdout, stderr });
      }
    );
  });
}

test("cli prints version info", async () => {
  const { stdout } = await runCli(["--version"], {
    env: {
      BIN_HOME_TEST_VERSIONS: JSON.stringify(["1.0.0", "2.0.0", "3.0.0"])
    }
  });
  const lines = stdout.trim().split(/\r?\n/);
  assert.equal(lines[0], `当前版本: ${packageJson.version}`);
  assert.equal(lines[1], "线上版本: 3.0.0,2.0.0,1.0.0");
});

test("cli prints help", async () => {
  const { stdout } = await runCli(["--help"]);
  assert.match(stdout, /Usage: bin-home/);
});

test("cli prints help when no args", async () => {
  const { stdout } = await runCli([]);
  assert.match(stdout, /Usage: bin-home/);
});

test("binu prints help when no args", async () => {
  const { stdout } = await runBinu([]);
  assert.match(stdout, /Usage: binu/);
  assert.match(stdout, /bin-home <command> --update/);
});

test("binu prints help with -h", async () => {
  const { stdout } = await runBinu(["-h"]);
  assert.match(stdout, /Usage: binu/);
  assert.match(stdout, /bin-home <command> --update/);
});
