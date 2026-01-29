#!/usr/bin/env node
const path = require("path");
const validateCommand = require("../lib/commandValidator");
const findPackageForCommand = require("../lib/packageFinder");
const displayPackageInfo = require("../lib/packageInfoFormatter");
const {
  fetchOnlineVersions,
  formatVersionOutput,
  chooseTargetVersion,
  runGlobalUpdate,
  isInteractiveSession
} = require("../lib/versionUpdate");

const COMMAND_NOT_FOUND_EXIT_CODE = 1;
const PACKAGE_NOT_FOUND_EXIT_CODE = 2;

async function printHelp() {
  const helpText = [
    "Usage: bin-home <command> [--open] [-l <n>]",
    "",
    "Options:",
    "  --help, -h                Show help",
    "  --version, -v             Show version",
    "  --update, -u              Update to specified version (keyboard select)",
    "  --open, -o                Open npm package page in browser",
    "  -l, --version-length <n>  Limit online version list length (default: 6)",
    "",
    "Example:",
    "  bin-home codex --open",
    "  bin-home codex -v -l 10"
  ].join("\n");

  if (isInteractiveSession()) {
    const { select } = await import("@inquirer/prompts");
    await select({
      message: "bin-home 帮助信息:",
      choices: [
        { name: "查看详细说明", value: "details", description: helpText },
        { name: "退出", value: "exit" }
      ]
    });
  } else {
    console.log(helpText);
  }
}

function parseArgs(argv) {
  const flags = new Set();
  let commandName = null;
  let versionLength = 6;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--version-length" || arg === "-l") {
      const nextArg = argv[i + 1];
      if (nextArg && !nextArg.startsWith("-")) {
        versionLength = parseInt(nextArg, 10) || 6;
        i++;
      }
    } else if (arg.startsWith("-")) {
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
    open: flags.has("--open") || flags.has("-o"),
    versionLength
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

async function showVersionInfo(commandName, options = {}) {
  const { packageName, localVersion } = await resolvePackageInfo(commandName);
  const onlineVersions = await fetchOnlineVersions(packageName, {
    limit: options.versionLength || 6,
    onLoading: () => {
      console.log("正在获取线上版本...");
    }
  });
  console.log(formatVersionOutput(packageName, localVersion, onlineVersions, options.showOnline));
  return { packageName, onlineVersions };
}

async function run() {
  const { commandName, help, version, update, open, versionLength } = parseArgs(
    process.argv.slice(2)
  );

  if (version || update) {
    const { packageName, onlineVersions } = await showVersionInfo(commandName, {
      versionLength,
      showOnline: !update
    });
    if (update) {
      const targetVersion = await chooseTargetVersion(packageName, onlineVersions);
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
    await printHelp();
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
