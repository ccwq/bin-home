const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { execFile } = require("node:child_process");

const cliPath = path.join(__dirname, "..", "bin", "cli.js");
const packageJson = require("../package.json");

function runCli(args) {
  return new Promise((resolve, reject) => {
    execFile(process.execPath, [cliPath, ...args], (error, stdout, stderr) => {
      if (error) {
        error.stdout = stdout;
        error.stderr = stderr;
        return reject(error);
      }
      resolve({ stdout, stderr });
    });
  });
}

test("cli prints version", async () => {
  const { stdout } = await runCli(["--version"]);
  assert.equal(stdout.trim(), packageJson.version);
});

test("cli prints help", async () => {
  const { stdout } = await runCli(["--help"]);
  assert.match(stdout, /Usage: bin-home/);
});

test("cli prints help when no args", async () => {
  const { stdout } = await runCli([]);
  assert.match(stdout, /Usage: bin-home/);
});
