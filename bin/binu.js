#!/usr/bin/env node
const path = require("path");

function printBinuHelp() {
  console.log("Usage: binu <command>");
  console.log("");
  console.log("说明: binu 是 bin-home <command> --update 的缩写。");
  console.log("功能: 显示版本信息并进入更新流程。");
  console.log("用法: binu <command>");
  console.log("示例: binu codex");
}

const args = process.argv.slice(2);
const showHelp =
  args.length === 0 || args.includes("--help") || args.includes("-h");

if (showHelp) {
  printBinuHelp();
  process.exit(0);
}

const hasUpdateFlag = args.includes("--update") || args.includes("-u");
const cliPath = path.join(__dirname, "cli.js");

// Ensure binu behaves like in-home <command> --update.
process.argv = [
  process.argv[0],
  cliPath,
  ...args,
  ...(hasUpdateFlag ? [] : ["--update"])
];

require("./cli");
