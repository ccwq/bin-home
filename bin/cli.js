#!/usr/bin/env node
const path = require("path");
const { spawn } = require("child_process");
const which = require("which");
const validateCommand = require("../lib/commandValidator");
const findPackageForCommand = require("../lib/packageFinder");
const displayPackageInfo = require("../lib/packageInfoFormatter");
const { debugLog } = require("../lib/debug");
const { t } = require("../lib/i18n");
const {
  fetchOnlineVersions,
  formatVersionOutput,
  chooseTargetVersion,
  runGlobalUpdate,
  isVoltaManagedCommand,
  isInteractiveSession,
  formatVersionDiffHint,
  promptToRunCli
} = require("../lib/versionUpdate");
const { parseCliOptions } = require("../lib/cliOptions");

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
  const runtimeVersionBeforeUpdate = await readRuntimeCommandVersion(commandName);
  const runtimeVersionNormalized = runtimeVersionBeforeUpdate
    ? runtimeVersionBeforeUpdate.replace(/^v/, "")
    : null;
  const localVersionNormalized = localVersion ? String(localVersion).replace(/^v/, "") : null;
  const hasRuntimeMismatch =
    Boolean(runtimeVersionNormalized) &&
    Boolean(localVersionNormalized) &&
    runtimeVersionNormalized !== localVersionNormalized;
  debugLog("version", "resolved local package version", {
    commandName: commandName || null,
    packageName,
    localVersion,
    runtimeVersion: runtimeVersionBeforeUpdate,
    hasRuntimeMismatch,
    update: options.update === true
  });

  if (hasRuntimeMismatch) {
    console.warn(
      `Warning: runtime '${commandName} --version' is '${runtimeVersionBeforeUpdate}', but resolved package version is '${localVersion}'.`
    );
  }
  const onlineVersions = await fetchOnlineVersions(packageName, {
    limit: options.versionLength || 6,
    onLoading: () => {
      console.log(t("loadingOnline"));
    }
  });

  const latestVersion = onlineVersions[0];
  const diffHint = latestVersion ? formatVersionDiffHint(localVersion, latestVersion) : null;
  debugLog("version", "resolved online versions", {
    packageName,
    latestVersion: latestVersion || null,
    versionCount: onlineVersions.length
  });

  if (options.update && diffHint && diffHint.isLatest) {
    console.log(`${t("currentVersion")}: ${packageName}@${localVersion}`);
    console.log(`\n${diffHint.emoji} ${diffHint.text}`);
    return { packageName, onlineVersions, diffHint, localVersion, latestVersion, skipUpdate: true };
  }

  const output = formatVersionOutput(packageName, localVersion, onlineVersions, {
    showOnline: options.showOnline
  });
  console.log(output);

  return { packageName, onlineVersions, diffHint, localVersion, latestVersion, skipUpdate: false };
}

function runCommandVersionCheck(commandPath) {
  return new Promise((resolve) => {
    let child;
    try {
      if (process.platform === "win32") {
        const cmd = process.env.ComSpec || "cmd.exe";
        child = spawn(cmd, ["/d", "/s", "/c", `"${commandPath}" --version`], {
          windowsHide: true,
          shell: false
        });
      } else {
        child = spawn(commandPath, ["--version"], {
          windowsHide: true,
          shell: false
        });
      }
    } catch (error) {
      debugLog("verify", "runtime version probe spawn failed", {
        commandPath,
        reason: error.message
      });
      resolve(null);
      return;
    }
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", () => {
      resolve(null);
    });
    child.on("close", (code) => {
      if (code !== 0) {
        resolve(null);
        return;
      }
      const text = (stdout || stderr).trim();
      if (!text) {
        resolve(null);
        return;
      }
      const firstLine = text.split(/\r?\n/)[0].trim();
      resolve(firstLine || null);
    });
  });
}

async function readRuntimeCommandVersion(commandName) {
  if (!commandName) {
    return null;
  }

  let resolvedPath;
  try {
    resolvedPath = await which(commandName);
  } catch (error) {
    debugLog("verify", "which failed before runtime version check", {
      commandName,
      reason: error.message
    });
    return null;
  }

  debugLog("verify", "resolved command path", {
    commandName,
    resolvedPath
  });

  const runtimeVersion = await runCommandVersionCheck(resolvedPath);
  debugLog("verify", "runtime version probe result", {
    commandName,
    runtimeVersion
  });
  return runtimeVersion;
}

async function run() {
  const { commandName, help, version, update, open, versionLength } = parseCliOptions(
    process.argv.slice(2)
  );

  if (version || update) {
    const { packageName, onlineVersions, diffHint, localVersion, latestVersion, skipUpdate } = await showVersionInfo(
      commandName,
      {
        versionLength,
        showOnline: true,
        update
      }
    );
    if (update) {
      if (skipUpdate) {
        return;
      }

      const targetVersion = await chooseTargetVersion(packageName, onlineVersions);
      if (!targetVersion) {
        console.log(t("updateCanceled"));
        return;
      }
      try {
        const useVolta = await isVoltaManagedCommand(commandName);
        debugLog("update", "computed update context", {
          commandName,
          packageName,
          currentVersion: localVersion,
          latestVersion: latestVersion || null,
          targetVersion,
          useVolta
        });
        console.log(t("updating"));
        await runGlobalUpdate(packageName, targetVersion, { useVolta });
        console.log(t("updateCompleted"));

        const runtimeVersion = await readRuntimeCommandVersion(commandName);
        if (runtimeVersion) {
          const normalizedRuntimeVersion = runtimeVersion.replace(/^v/, "");
          const expectedVersion = targetVersion === "latest" ? latestVersion : targetVersion;
          const normalizedExpectedVersion = String(expectedVersion || "").replace(/^v/, "");
          const matchesTarget =
            !normalizedExpectedVersion || normalizedRuntimeVersion === normalizedExpectedVersion;
          debugLog("verify", "post-update runtime verification", {
            commandName,
            runtimeVersion,
            targetVersion,
            expectedVersion,
            matchesTarget
          });
          if (!matchesTarget) {
            console.warn(
              `Warning: runtime '${commandName} --version' is '${runtimeVersion}', expected '${expectedVersion}'.`
            );
          }
        }

        const shouldRunCli = await promptToRunCli();
        if (shouldRunCli && commandName) {
          try {
            const resolvedPath = await which(commandName);
            const child = spawn(resolvedPath, [], {
              stdio: "inherit",
              shell: true
            });
            child.on("error", (error) => {
              console.error(`Failed to run ${commandName}: ${error.message}`);
            });
          } catch (error) {
            console.error(`Command not found: ${commandName}`);
          }
        }
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
