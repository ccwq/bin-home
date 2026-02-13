const { exec } = require("child_process");
const which = require("which");
const fs = require("fs/promises");
const path = require("path");
const { debugLog } = require("./debug");

const NPM_LIST_EXIT_CODE = 3;
const PACKAGE_JSON_EXIT_CODE = 4;

async function resolveCommandPath(commandName) {
  try {
    return await which(commandName);
  } catch (error) {
    return null;
  }
}

function isVoltaShimPath(commandPath) {
  if (!commandPath) {
    return false;
  }
  const normalizedPath = path.normalize(commandPath).toLowerCase();
  const voltaRootSegment = `${path.sep}volta${path.sep}`.toLowerCase();
  return normalizedPath.includes(voltaRootSegment);
}

function execNpmList() {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const command = `${npmCommand} ls -g --depth=0 --json`;
  return new Promise((resolve, reject) => {
    exec(
      command,
      { maxBuffer: 10 * 1024 * 1024, windowsHide: true },
      (error, stdout) => {
        if (error) {
          const err = new Error(
            `Failed to list global npm packages: ${error.message}`
          );
          err.exitCode = NPM_LIST_EXIT_CODE;
          return reject(err);
        }
        resolve(stdout);
      }
    );
  });
}

function execNpmRoot() {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const command = `${npmCommand} root -g`;
  return new Promise((resolve, reject) => {
    exec(command, { windowsHide: true }, (error, stdout) => {
      if (error) {
        const err = new Error(
          `Failed to list global npm packages: ${error.message}`
        );
        err.exitCode = NPM_LIST_EXIT_CODE;
        return reject(err);
      }
      resolve(stdout.trim());
    });
  });
}

function getCommandNamesForStringBin(packageName) {
  const names = new Set();
  if (packageName) {
    names.add(packageName);
    if (packageName.startsWith("@")) {
      const parts = packageName.split("/");
      if (parts[1]) {
        names.add(parts[1]);
      }
    }
  }
  return names;
}

async function readPackageJson(packagePath, packageName) {
  const packageJsonPath = path.join(packagePath, "package.json");
  try {
    const contents = await fs.readFile(packageJsonPath, "utf8");
    return JSON.parse(contents);
  } catch (error) {
    const err = new Error(
      `Failed to read package.json for ${packageName}: ${error.message}`
    );
    err.exitCode = PACKAGE_JSON_EXIT_CODE;
    throw err;
  }
}

async function listGlobalPackages(nodeModulesRoot) {
  try {
    const entries = await fs.readdir(nodeModulesRoot, { withFileTypes: true });
    const packages = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      if (entry.name.startsWith("@")) {
        const scopePath = path.join(nodeModulesRoot, entry.name);
        const scopedEntries = await fs.readdir(scopePath, {
          withFileTypes: true
        });
        for (const scopedEntry of scopedEntries) {
          if (!scopedEntry.isDirectory()) {
            continue;
          }
          packages.push({
            name: `${entry.name}/${scopedEntry.name}`,
            path: path.join(scopePath, scopedEntry.name)
          });
        }
      } else {
        packages.push({
          name: entry.name,
          path: path.join(nodeModulesRoot, entry.name)
        });
      }
    }

    return packages;
  } catch (error) {
    const err = new Error(
      `Failed to read package.json for global packages: ${error.message}`
    );
    err.exitCode = PACKAGE_JSON_EXIT_CODE;
    throw err;
  }
}

async function resolveVoltaPackage(commandName) {
  try {
    await which("volta");
  } catch (error) {
    debugLog("packageFinder", "volta not available");
    return null;
  }

  const command = `volta which ${commandName}`;
  const voltaPath = await new Promise((resolve, reject) => {
    exec(command, { windowsHide: true }, (error, stdout) => {
      if (error) {
        return reject(error);
      }
      resolve(stdout.trim());
    });
  }).catch(() => null);

  if (!voltaPath) {
    debugLog("packageFinder", "volta which returned empty", { commandName });
    return null;
  }

  const parts = path.normalize(voltaPath).split(path.sep);
  const packagesIndex = parts.lastIndexOf("packages");
  if (packagesIndex === -1 || !parts[packagesIndex + 1]) {
    debugLog("packageFinder", "volta path has no packages segment", { voltaPath });
    return null;
  }

  const scopeOrName = parts[packagesIndex + 1];
  const isScoped = scopeOrName.startsWith("@");
  // Volta 的 packages 路径可能包含 scoped 包，需要拼出 @scope/name 的真实包名与路径。
  if (isScoped && !parts[packagesIndex + 2]) {
    debugLog("packageFinder", "invalid scoped package path from volta", { voltaPath });
    return null;
  }

  const packageName = isScoped
    ? `${scopeOrName}/${parts[packagesIndex + 2]}`
    : scopeOrName;
  const packageRootParts = isScoped
    ? parts.slice(0, packagesIndex + 3)
    : parts.slice(0, packagesIndex + 2);
  const packageNameParts = isScoped
    ? [scopeOrName, parts[packagesIndex + 2]]
    : [scopeOrName];
  const packagePath = path.join(
    ...packageRootParts,
    "node_modules",
    ...packageNameParts
  );

  const packageJson = await readPackageJson(packagePath, packageName);
  debugLog("packageFinder", "resolved package from volta", {
    commandName,
    packageName,
    packagePath,
    version: packageJson.version
  });
  return { packageName, packagePath, packageJson };
}

async function findPackageForCommand(commandName) {
  const commandPath = await resolveCommandPath(commandName);
  const preferVoltaResolution = isVoltaShimPath(commandPath);
  debugLog("packageFinder", "command resolution context", {
    commandName,
    commandPath,
    preferVoltaResolution
  });

  if (preferVoltaResolution) {
    const voltaPackage = await resolveVoltaPackage(commandName);
    if (voltaPackage) {
      debugLog("packageFinder", "preferred volta package for command", {
        commandName,
        packageName: voltaPackage.packageName,
        packagePath: voltaPackage.packagePath,
        version: voltaPackage.packageJson && voltaPackage.packageJson.version
      });
      return voltaPackage;
    }
    debugLog("packageFinder", "volta preferred but no package resolved, fallback to npm scan", {
      commandName
    });
  }

  const [output, npmRoot] = await Promise.all([
    execNpmList(),
    execNpmRoot()
  ]);

  let parsed;
  try {
    parsed = JSON.parse(output);
  } catch (error) {
    const err = new Error(
      `Failed to list global npm packages: ${error.message}`
    );
    err.exitCode = NPM_LIST_EXIT_CODE;
    throw err;
  }

  const dependencies = parsed.dependencies || {};
  const nodeModulesRoot = npmRoot || "";
  const checked = new Set();

  for (const packageName of Object.keys(dependencies)) {
    const packagePath = path.join(nodeModulesRoot, packageName);
    checked.add(packageName);
    const packageJson = await readPackageJson(packagePath, packageName);
    const bin = packageJson.bin;

    if (typeof bin === "string") {
      const candidateNames = getCommandNamesForStringBin(
        packageJson.name || packageName
      );
      if (candidateNames.has(commandName)) {
        debugLog("packageFinder", "matched package from npm dependency list", {
          commandName,
          packageName,
          packagePath,
          version: packageJson.version
        });
        return { packageName, packagePath, packageJson };
      }
    } else if (bin && typeof bin === "object") {
      if (Object.prototype.hasOwnProperty.call(bin, commandName)) {
        debugLog("packageFinder", "matched package from npm dependency list", {
          commandName,
          packageName,
          packagePath,
          version: packageJson.version
        });
        return { packageName, packagePath, packageJson };
      }
    }
  }

  if (nodeModulesRoot) {
    const packages = await listGlobalPackages(nodeModulesRoot);
    for (const pkg of packages) {
      if (checked.has(pkg.name)) {
        continue;
      }
      const packageJson = await readPackageJson(pkg.path, pkg.name);
      const bin = packageJson.bin;

      if (typeof bin === "string") {
        const candidateNames = getCommandNamesForStringBin(
          packageJson.name || pkg.name
        );
        if (candidateNames.has(commandName)) {
          debugLog("packageFinder", "matched package from npm filesystem scan", {
            commandName,
            packageName: pkg.name,
            packagePath: pkg.path,
            version: packageJson.version
          });
          return {
            packageName: pkg.name,
            packagePath: pkg.path,
            packageJson
          };
        }
      } else if (bin && typeof bin === "object") {
        if (Object.prototype.hasOwnProperty.call(bin, commandName)) {
          debugLog("packageFinder", "matched package from npm filesystem scan", {
            commandName,
            packageName: pkg.name,
            packagePath: pkg.path,
            version: packageJson.version
          });
          return {
            packageName: pkg.name,
            packagePath: pkg.path,
            packageJson
          };
        }
      }
    }
  }

  const voltaPackage = await resolveVoltaPackage(commandName);
  if (voltaPackage) {
    debugLog("packageFinder", "using package resolved by volta", {
      commandName,
      packageName: voltaPackage.packageName,
      packagePath: voltaPackage.packagePath,
      version: voltaPackage.packageJson && voltaPackage.packageJson.version
    });
    return voltaPackage;
  }

  debugLog("packageFinder", "no package matched for command", { commandName });
  return null;
}

module.exports = findPackageForCommand;
