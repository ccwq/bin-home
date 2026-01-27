const which = require("which");

async function validateCommand(commandName) {
  if (!commandName || typeof commandName !== "string") {
    return false;
  }

  try {
    await which(commandName);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = validateCommand;
