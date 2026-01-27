const test = require("node:test");
const assert = require("node:assert/strict");

const displayPackageInfo = require("../lib/packageInfoFormatter");

function captureConsole(callback) {
  const originalLog = console.log;
  const originalError = console.error;
  const logs = [];
  const errors = [];
  console.log = (message) => logs.push(message);
  console.error = (message) => errors.push(message);

  return Promise.resolve()
    .then(callback)
    .then(() => ({ logs, errors }))
    .finally(() => {
      console.log = originalLog;
      console.error = originalError;
    });
}

test("displayPackageInfo prints npm and github info", async () => {
  const packageInfo = {
    packageName: "@openai/codex",
    packagePath: "/tmp",
    packageJson: {
      repository: "https://github.com/openai/codex"
    }
  };

  const { logs, errors } = await captureConsole(() =>
    displayPackageInfo("codex", packageInfo, false)
  );

  assert.deepEqual(errors, []);
  assert.equal(logs[0], "npm: @openai/codex");
  assert.equal(logs[1], "npm url: https://www.npmjs.com/package/@openai/codex");
  assert.equal(logs[2], "github: https://github.com/openai/codex");
});

test("displayPackageInfo reports missing repo as unavailable", async () => {
  const packageInfo = {
    packageName: "example",
    packagePath: "/tmp",
    packageJson: {}
  };

  const { logs } = await captureConsole(() =>
    displayPackageInfo("example", packageInfo, false)
  );

  assert.equal(logs[2], "github: unavailable");
});

test("displayPackageInfo reports open errors", async () => {
  const packageInfo = {
    packageName: "example",
    packagePath: "/tmp",
    packageJson: {}
  };

  const openStub = async () => {
    throw new Error("boom");
  };

  const { errors } = await captureConsole(() =>
    displayPackageInfo("example", packageInfo, true, openStub)
  );

  assert.equal(errors[0], "Failed to open URL in browser: boom");
});
