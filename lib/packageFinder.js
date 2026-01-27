const { exec } = require("child_process");
const which = require("which");
const fs = require("fs/promises");
const path = require("path");

const NPM_LIST_EXIT_CODE = 3;
const PACKAGE_JSON_EXIT_CODE = 4;

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
    return null;
  }

  const parts = path.normalize(voltaPath).split(path.sep);
  const packagesIndex = parts.lastIndexOf("packages");
  if (packagesIndex === -1 || !parts[packagesIndex + 1]) {
    return null;
  }

  const packageName = parts[packagesIndex + 1];
  const packagePath = path.join(
    ...parts.slice(0, packagesIndex + 2),
    "node_modules",
    packageName
  );

  const packageJson = await readPackageJson(packagePath, packageName);
  return { packageName, packagePath, packageJson };
}

async function findPackageForCommand(commandName) {
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
        return { packageName, packagePath, packageJson };
      }
    } else if (bin && typeof bin === "object") {
      if (Object.prototype.hasOwnProperty.call(bin, commandName)) {
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
          return {
            packageName: pkg.name,
            packagePath: pkg.path,
            packageJson
          };
        }
      } else if (bin && typeof bin === "object") {
        if (Object.prototype.hasOwnProperty.call(bin, commandName)) {
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
    return voltaPackage;
  }

  return null;
}

module.exports = findPackageForCommand;
