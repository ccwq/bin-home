const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");

const validateCommand = require("../lib/commandValidator");

async function createTempCommand(commandName) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "bin-home-"));
  const isWindows = process.platform === "win32";
  const filename = isWindows ? `${commandName}.cmd` : commandName;
  const filePath = path.join(dir, filename);
  const contents = isWindows
    ? "@echo off\r\nexit /b 0\r\n"
    : "#!/usr/bin/env sh\nexit 0\n";
  await fs.writeFile(filePath, contents, "utf8");
  if (!isWindows) {
    await fs.chmod(filePath, 0o755);
  }
  return { dir, commandName };
}

test("validateCommand returns true for a command on PATH", async () => {
  const commandName = "bin-home-test-cmd";
  const { dir } = await createTempCommand(commandName);
  const originalPath = process.env.PATH;
  process.env.PATH = `${dir}${path.delimiter}${originalPath}`;

  try {
    const exists = await validateCommand(commandName);
    assert.equal(exists, true);
  } finally {
    process.env.PATH = originalPath;
  }
});

test("validateCommand returns false for a missing command", async () => {
  const exists = await validateCommand("bin-home-missing-cmd");
  assert.equal(exists, false);
});
