const test = require("node:test");
const assert = require("node:assert/strict");
const { parseCliOptions } = require("../lib/cliOptions");

test("parseCliOptions parses short and long options with defaults", () => {
  const result = parseCliOptions(["codex", "-v", "-l", "10"]);
  assert.strictEqual(result.commandName, "codex");
  assert.strictEqual(result.version, true);
  assert.strictEqual(result.versionLength, 10);
});

test("parseCliOptions parses --version-length with number", () => {
  const result = parseCliOptions(["codex", "--version-length", "6"]);
  assert.strictEqual(result.commandName, "codex");
  assert.strictEqual(result.versionLength, 6);
});

test("parseCliOptions uses default versionLength when not provided", () => {
  const result = parseCliOptions(["codex", "-v"]);
  assert.strictEqual(result.versionLength, 6);
});

test("parseCliOptions parses --help and -h", () => {
  const result1 = parseCliOptions(["codex", "--help"]);
  assert.strictEqual(result1.help, true);

  const result2 = parseCliOptions(["codex", "-h"]);
  assert.strictEqual(result2.help, true);
});

test("parseCliOptions parses --update and -u", () => {
  const result1 = parseCliOptions(["codex", "--update"]);
  assert.strictEqual(result1.update, true);

  const result2 = parseCliOptions(["codex", "-u"]);
  assert.strictEqual(result2.update, true);
});

test("parseCliOptions parses --open and -o", () => {
  const result1 = parseCliOptions(["codex", "--open"]);
  assert.strictEqual(result1.open, true);

  const result2 = parseCliOptions(["codex", "-o"]);
  assert.strictEqual(result2.open, true);
});

test("parseCliOptions handles no command scenario", () => {
  const result = parseCliOptions(["--version"]);
  assert.strictEqual(result.commandName, null);
  assert.strictEqual(result.version, true);
});

test("parseCliOptions handles empty argv", () => {
  const result = parseCliOptions([]);
  assert.strictEqual(result.commandName, null);
  assert.strictEqual(result.help, false);
  assert.strictEqual(result.version, false);
  assert.strictEqual(result.update, false);
  assert.strictEqual(result.open, false);
  assert.strictEqual(result.versionLength, 6);
});

test("parseCliOptions applies defaultUpdate when provided", () => {
  const result = parseCliOptions(["codex"], true);
  assert.strictEqual(result.update, true);
});

test("parseCliOptions does not override explicit update flag with default", () => {
  const result = parseCliOptions(["codex", "-u"], true);
  assert.strictEqual(result.update, true);
});

test("parseCliOptions parses all options together", () => {
  const result = parseCliOptions(["codex", "-v", "-l", "5", "--open"]);
  assert.strictEqual(result.commandName, "codex");
  assert.strictEqual(result.version, true);
  assert.strictEqual(result.open, true);
  assert.strictEqual(result.versionLength, 5);
  assert.strictEqual(result.help, false);
  assert.strictEqual(result.update, false);
});
