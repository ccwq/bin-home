#!/usr/bin/env node
const path = require("path");
const validateCommand = require("../lib/commandValidator");
const findPackageForCommand = require("../lib/packageFinder");
const displayPackageInfo = require("../lib/packageInfoFormatter");
const {
  fetchOnlineVersions,
  formatVersionOutput,
  chooseTargetVersion,
  runGlobalUpdate
} = require("../lib/versionUpdate");

const COMMAND_NOT_FOUND_EXIT_CODE = 1;
const PACKAGE_NOT_FOUND_EXIT_CODE = 2;

function printHelp() {
  console.log("Usage: bin-home <command> [--open]");
  console.log("");
  console.log("Options:");
  console.log("  --help, -h     Show help");
  console.log("  --version, -v  Show version");
  console.log("  --update, -u   Update to specified version (keyboard select)");
  console.log("  --open, -o     Open npm package page in browser");
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
    update: flags.has("--update") || flags.has("-u"),
    open: flags.has("--open") || flags.has("-o")
  };
}

async function resolvePackageInfo(commandName) {
  if (!commandName) {
    const packageJson = require(path.join(__dirname, "..", "package.json"));
    return { packageName: packageJson.name, localVersion: packageJson.version };
  }

  const commandExists = await validateCommand(commandName);
  if (!commandExists) {
    const error = new Error(`Command '${commandName}' not found in system PATH`);
    error.exitCode = COMMAND_NOT_FOUND_EXIT_CODE;
    throw error;
  }

  const packageInfo = await findPackageForCommand(commandName);
  if (!packageInfo) {
    const error = new Error(
      `No npm package found for command '${commandName}'. It may not be installed via npm.`
    );
    error.exitCode = PACKAGE_NOT_FOUND_EXIT_CODE;
    throw error;
  }

  const packageName = packageInfo.packageJson.name || packageInfo.packageName;
  return {
    packageName,
    localVersion: packageInfo.packageJson.version
  };
}

async function showVersionInfo(commandName) {
  const { packageName, localVersion } = await resolvePackageInfo(commandName);
  const onlineVersions = await fetchOnlineVersions(packageName, {
    limit: 6,
    onLoading: () => {
      console.log("正在获取线上版本...");
    }
  });
  console.log(formatVersionOutput(localVersion, onlineVersions));
  return { packageName, onlineVersions };
}

async function run() {
  const { commandName, help, version, update, open } = parseArgs(
    process.argv.slice(2)
  );

  if (version || update) {
    const { packageName, onlineVersions } = await showVersionInfo(commandName);
    if (update) {
      const targetVersion = await chooseTargetVersion(onlineVersions);
      if (!targetVersion) {
        console.log("已取消更新");
        return;
      }
      try {
        console.log("正在更新...");
        await runGlobalUpdate(packageName, targetVersion);
        console.log("更新完成");
      } catch (error) {
        console.error("更新失败");
        if (typeof error.exitCode === "number") {
          process.exit(error.exitCode);
        }
        throw error;
      }
    }
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
