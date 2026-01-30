const test = require("node:test");
const assert = require("node:assert/strict");

const {
  fetchOnlineVersions,
  formatVersionOutput,
  chooseTargetVersion,
  runGlobalUpdate,
  parseVersion,
  compareVersions,
  formatVersionDiffHint,
  promptToRunCli
} = require("../lib/versionUpdate");
const { t } = require("../lib/i18n");
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
  assert.ok(output.startsWith(`${t("currentVersion")}: @demo/pkg@1.2.3`));
  assert.ok(output.includes(t("onlineVersion")));
  assert.ok(output.includes("需要更新"));
});

test("formatVersionOutput can hide online versions", () => {
  const output = formatVersionOutput("@demo/pkg", "1.2.3", ["2.0.0", "1.9.0"], { showOnline: false });
  assert.equal(output, `${t("currentVersion")}: @demo/pkg@1.2.3`);
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

test("parseVersion extracts major, minor, patch from version string", () => {
  assert.deepEqual(parseVersion("1.2.3"), { major: 1, minor: 2, patch: 3 });
  assert.deepEqual(parseVersion("v2.0.0"), { major: 2, minor: 0, patch: 0 });
  assert.deepEqual(parseVersion(""), { major: 0, minor: 0, patch: 0 });
  assert.deepEqual(parseVersion(null), { major: 0, minor: 0, patch: 0 });
});

test("compareVersions returns correct diff level", () => {
  assert.equal(compareVersions("1.2.3", "2.0.0"), "major");
  assert.equal(compareVersions("1.2.3", "1.3.0"), "minor");
  assert.equal(compareVersions("1.2.3", "1.2.4"), "patch");
  assert.equal(compareVersions("1.2.3", "1.2.3"), "none");
});

test("formatVersionDiffHint returns latest message when versions match", () => {
  const hint = formatVersionDiffHint("1.2.3", "1.2.3");
  assert.equal(hint.isLatest, true);
  assert.ok(hint.text.includes(t("alreadyLatest")));
  assert.ok(hint.emoji);
});

test("formatVersionDiffHint returns update hint when versions differ", () => {
  const majorHint = formatVersionDiffHint("1.2.3", "2.0.0");
  assert.equal(majorHint.isLatest, false);
  assert.ok(majorHint.text.includes("需要更新"));
  assert.ok(majorHint.text.includes("重大"));

  const minorHint = formatVersionDiffHint("1.2.3", "1.3.0");
  assert.equal(minorHint.isLatest, false);
  assert.ok(minorHint.text.includes("需要更新"));
  assert.ok(minorHint.text.includes("次要"));

  const patchHint = formatVersionDiffHint("1.2.3", "1.2.4");
  assert.equal(patchHint.isLatest, false);
  assert.ok(patchHint.text.includes("需要更新"));
  assert.ok(patchHint.text.includes("补丁"));
});

test("formatVersionOutput includes diff hint when showing online versions", () => {
  const output = formatVersionOutput("@demo/pkg", "1.2.3", ["2.0.0", "1.9.0"]);
  assert.ok(output.includes("需要更新"));
  assert.ok(output.includes("重大"));
});

test("formatVersionOutput includes latest message when already latest", () => {
  const output = formatVersionOutput("@demo/pkg", "1.2.3", ["1.2.3"]);
  assert.ok(output.includes(t("alreadyLatest")));
});
