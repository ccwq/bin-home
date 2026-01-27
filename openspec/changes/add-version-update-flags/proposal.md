# Change: Add online version lookup and update flow for -v/-u

## Why
用户需要直接查看线上最新版并从 CLI 内完成更新，无需手动查找版本。

## What Changes
- `-v/--version` 改为输出当前版本与线上最新 6 个版本（**BREAKING**）。需要澄清的时候, 必须包含第二个参数, 否则就是自身的版本
- - bin-home --version # 显示自身版本
- - bin-home codex --version #显示codex的本地和线上版本
- 新增 `-u/--update`：展示版本信息后提示输入，默认 `latest`，随后执行全局更新。

## Impact
- Affected specs: `specs/cli-version-update/spec.md`
- Affected code: `bin/cli.js`, `lib/`（版本查询与更新逻辑）
