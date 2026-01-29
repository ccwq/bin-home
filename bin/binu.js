#!/usr/bin/env node
const path = require("path");

const { isInteractiveSession } = require("../lib/versionUpdate");
const { t } = require("../lib/i18n");

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
  const args = process.argv.slice(2);
  const showHelp =
    args.length === 0 || args.includes("--help") || args.includes("-h");

  if (showHelp) {
    await printBinuHelp();
    process.exit(0);
  }

  const hasUpdateFlag = args.includes("--update") || args.includes("-u");
  const cliPath = path.join(__dirname, "cli.js");

  // Ensure binu behaves like binu-home <command> --update.
  process.argv = [
    process.argv[0],
    cliPath,
    ...args,
    ...(hasUpdateFlag ? [] : ["--update"])
  ];

  require("./cli");
}

run().catch(console.error);
