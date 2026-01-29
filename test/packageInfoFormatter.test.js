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

const { t } = require("../lib/i18n");

test("displayPackageInfo reports open errors", async (tContext) => {
  const consoleError = tContext.mock.method(console, "error", () => {});
  const packageInfo = {
    packageName: "foo",
    packageJson: { repository: "foo/bar" }
  };
  const openImpl = () => {
    throw new Error("boom");
  };

  await displayPackageInfo("foo", packageInfo, true, openImpl);
  
  assert.equal(consoleError.mock.calls.length, 1);
  assert.equal(consoleError.mock.calls[0].arguments[0], t("openError", "boom"));
});
