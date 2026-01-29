const parseRepository = require("./repositoryParser");
const { t } = require("./i18n");

async function resolveOpen() {
  const mod = await import("open");
  return mod.default || mod;
}

async function displayPackageInfo(
  commandName,
  packageInfo,
  shouldOpen = false,
  openImpl
) {
  const packageName = packageInfo.packageName;
  const npmUrl = `https://www.npmjs.com/package/${packageName}`;
  const repoUrl = parseRepository(packageInfo.packageJson.repository);

  console.log(`npm: ${packageName}`);
  console.log(`npm url: ${npmUrl}`);
  console.log(`github: ${repoUrl || "unavailable"}`);

  if (shouldOpen) {
    try {
      const openFn = openImpl || (await resolveOpen());
      if (typeof openFn !== "function") {
        throw new Error("open is not a function");
      }
      await openFn(npmUrl);
    } catch (error) {
      console.error(t("openError", error.message));
    }
  }
}

module.exports = displayPackageInfo;
