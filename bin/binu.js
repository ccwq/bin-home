#!/usr/bin/env node
const path = require("path");

const { isInteractiveSession } = require("../lib/versionUpdate");

async function printBinuHelp() {
  const helpText = [
    "Usage: binu <command> [-l <n>]",
    "",
    "说明: binu 是 bin-home <command> --update 的缩写。",
    "功能: 显示版本信息并进入更新流程。",
    "用法: binu <command> [-l <n>]",
    "选项:",
    "  -l, --version-length <n>  限制显示的线上版本数量 (默认: 6)",
    "示例: binu codex -l 10"
  ].join("\n");

  if (isInteractiveSession()) {
    const { select } = await import("@inquirer/prompts");
    await select({
      message: "binu 帮助信息:",
      choices: [
        { name: "查看详细说明", value: "details", description: helpText },
        { name: "退出", value: "exit" }
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
