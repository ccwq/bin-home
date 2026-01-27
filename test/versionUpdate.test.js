const test = require("node:test");
const assert = require("node:assert/strict");

const {
  fetchOnlineVersions,
  formatVersionOutput,
  runGlobalUpdate
} = require("../lib/versionUpdate");

function createExecStub({ stdout = "", error = null, onCommand } = {}) {
  return (command, options, callback) => {
    if (onCommand) {
      onCommand(command, options);
    }
    callback(error, stdout, "");
  };
}

test("fetchOnlineVersions returns newest 6 versions", async () => {
  const execFn = createExecStub({
    stdout: JSON.stringify([
      "0.1.0",
      "0.2.0",
      "0.3.0",
      "0.4.0",
      "0.5.0",
      "0.6.0",
      "0.7.0"
    ])
  });

  const versions = await fetchOnlineVersions("@demo/pkg", {
    execFn,
    limit: 6
  });
  assert.deepEqual(versions, [
    "0.7.0",
    "0.6.0",
    "0.5.0",
    "0.4.0",
    "0.3.0",
    "0.2.0"
  ]);
});

test("formatVersionOutput returns two-line output", () => {
  const output = formatVersionOutput("1.2.3", ["2.0.0", "1.9.0"]);
  assert.equal(output, "当前版本: 1.2.3\n线上版本: 2.0.0,1.9.0");
});

test("runGlobalUpdate uses npm command with package and version", async () => {
  let captured = null;
  const execFn = createExecStub({
    onCommand: (command) => {
      captured = command;
    }
  });

  await runGlobalUpdate("@demo/pkg", "1.2.3", { execFn });
  assert.match(captured, /npm(.cmd)? i -g @demo\/pkg@1.2.3/);
});
