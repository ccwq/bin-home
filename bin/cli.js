#!/usr/bin/env node
const path = require("path");
const validateCommand = require("../lib/commandValidator");
const findPackageForCommand = require("../lib/packageFinder");
const displayPackageInfo = require("../lib/packageInfoFormatter");

const COMMAND_NOT_FOUND_EXIT_CODE = 1;
const PACKAGE_NOT_FOUND_EXIT_CODE = 2;

function printHelp() {
  console.log("Usage: bin-home <command> [--open]");
  console.log("");
  console.log("Options:");
  console.log("  --help, -h     Show help");
  console.log("  --version, -v  Show version");
  console.log("  --open, -o     Open npm package page in browser");
}

function printVersion() {
  const packageJson = require(path.join(__dirname, "..", "package.json"));
  console.log(packageJson.version);
}

function parseArgs(argv) {
  const flags = new Set();
  let commandName = null;

  for (const arg of argv) {
    if (arg.startsWith("-")) {
      flags.add(arg);
    } else if (!commandName) {
      commandName = arg;
    }
  }

  return {
    commandName,
    help: flags.has("--help") || flags.has("-h"),
    version: flags.has("--version") || flags.has("-v"),
    open: flags.has("--open") || flags.has("-o")
  };
}

async function run() {
  const { commandName, help, version, open } = parseArgs(process.argv.slice(2));

  if (version) {
    printVersion();
    return;
  }

  if (help || !commandName) {
    printHelp();
    return;
  }

  const commandExists = await validateCommand(commandName);
  if (!commandExists) {
    console.error(`Command '${commandName}' not found in system PATH`);
    process.exit(COMMAND_NOT_FOUND_EXIT_CODE);
  }

  const packageInfo = await findPackageForCommand(commandName);
  if (!packageInfo) {
    console.error(
      `No npm package found for command '${commandName}'. It may not be installed via npm.`
    );
    process.exit(PACKAGE_NOT_FOUND_EXIT_CODE);
  }

  await displayPackageInfo(commandName, packageInfo, open);
}

run().catch((error) => {
  if (typeof error.exitCode === "number") {
    console.error(error.message);
    process.exit(error.exitCode);
  }

  console.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});
