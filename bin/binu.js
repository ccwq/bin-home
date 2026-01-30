#!/usr/bin/env node
const path = require("path");

const { isInteractiveSession } = require("../lib/versionUpdate");
const { t } = require("../lib/i18n");
const { parseCliOptions } = require("../lib/cliOptions");

async function printBinuHelp() {
  const helpText = [
    `${t("binuUsage")}: binu <command> [-l <n>]`,
    "",
    t("binuDesc"),
    t("binuFunc"),
    `${t("binuUsage")}: binu <command> [-l <n>]`,
    `${t("options")}:`,
    `  -l, --version-length <n>  ${t("versionLength")}`,
    `${t("example")}: binu codex -l 10`
  ].join("\n");

  if (isInteractiveSession()) {
    const { select } = await import("@inquirer/prompts");
    await select({
      message: `binu ${t("helpMessage")}`,
      choices: [
        { name: t("viewDetails"), value: "details", description: helpText },
        { name: t("exit"), value: "exit" }
      ]
    });
  } else {
    console.log(helpText);
  }
}

async function run() {
  const { commandName, help, versionLength } = parseCliOptions(process.argv.slice(2), true);

  if (help || !commandName) {
    await printBinuHelp();
    process.exit(0);
  }

  const cliPath = path.join(__dirname, "cli.js");

  process.argv = [
    process.argv[0],
    cliPath,
    commandName,
    "--update",
    "-l",
    String(versionLength)
  ];

  require("./cli");
}

run().catch(console.error);
