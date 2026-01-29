#!/usr/bin/env node
const path = require("path");
const validateCommand = require("../lib/commandValidator");
const findPackageForCommand = require("../lib/packageFinder");
const displayPackageInfo = require("../lib/packageInfoFormatter");
const { t } = require("../lib/i18n");
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
    `${t("usage")}: bin-home <command> [--open] [-l <n>]`,
    "",
    `${t("options")}:`,
    `  --help, -h                ${t("help")}`,
    `  --version, -v             ${t("version")}`,
    `  --update, -u              ${t("update")}`,
    `  --open, -o                ${t("open")}`,
    `  -l, --version-length <n>  ${t("versionLength")}`,
    "",
    `${t("example")}:`,
    "  bin-home codex --open",
    "  bin-home codex -v -l 10"
  ].join("\n");

  if (isInteractiveSession()) {
    const { select } = await import("@inquirer/prompts");
    await select({
      message: `bin-home ${t("helpMessage")}`,
      choices: [
        { name: t("viewDetails"), value: "details", description: helpText },
        { name: t("exit"), value: "exit" }
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
    const error = new Error(t("commandNotFound", commandName));
    error.exitCode = COMMAND_NOT_FOUND_EXIT_CODE;
    throw error;
  }

  const packageInfo = await findPackageForCommand(commandName);
  if (!packageInfo) {
    const error = new Error(t("packageNotFound", commandName));
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
      console.log(t("loadingOnline"));
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
        console.log(t("updateCanceled"));
        return;
      }
      try {
        console.log(t("updating"));
        await runGlobalUpdate(packageName, targetVersion);
        console.log(t("updateCompleted"));
      } catch (error) {
        console.error(t("updateFailed"));
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
