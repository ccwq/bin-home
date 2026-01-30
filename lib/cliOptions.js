const { Command, Option } = require("commander");

function parseCliOptions(argv = process.argv, defaultUpdate = false) {
  let commandName = null;
  let versionLength = 6;
  const flags = new Set();

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
    update: flags.has("--update") || flags.has("-u") || defaultUpdate,
    open: flags.has("--open") || flags.has("-o"),
    versionLength
  };
}

module.exports = { parseCliOptions };
