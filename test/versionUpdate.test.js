const test = require("node:test");
const assert = require("node:assert/strict");

const {
  fetchOnlineVersions,
  formatVersionOutput,
  chooseTargetVersion,
  runGlobalUpdate
} = require("../lib/versionUpdate");
const { PassThrough } = require("node:stream");

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

test("formatVersionOutput returns output with package name", () => {
  const output = formatVersionOutput("@demo/pkg", "1.2.3", ["2.0.0", "1.9.0"]);
  assert.equal(output, "当前版本: @demo/pkg@1.2.3\n线上版本: 2.0.0,1.9.0");
});

test("formatVersionOutput can hide online versions", () => {
  const output = formatVersionOutput("@demo/pkg", "1.2.3", ["2.0.0", "1.9.0"], false);
  assert.equal(output, "当前版本: @demo/pkg@1.2.3");
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

test("fetchOnlineVersions triggers loading callback when fetching npm", async () => {
  let loadingCalls = 0;
  const execFn = createExecStub({
    stdout: JSON.stringify(["1.0.0"])
  });

  await fetchOnlineVersions("@demo/pkg", {
    execFn,
    onLoading: () => {
      loadingCalls += 1;
    }
  });

  assert.equal(loadingCalls, 1);
});

test("chooseTargetVersion falls back to prompt in non-interactive session", async () => {
  const input = new PassThrough();
  const output = new PassThrough();
  input.isTTY = false;
  output.isTTY = false;

  const choicePromise = chooseTargetVersion("@demo/pkg", ["1.0.0"], {
    input,
    output,
    defaultVersion: "latest",
    interactive: false
  });

  input.write("\n");
  const choice = await choicePromise;
  assert.equal(choice, "latest");
});
