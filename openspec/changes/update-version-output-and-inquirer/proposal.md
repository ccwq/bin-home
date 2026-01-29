# Change: 版本输出与交互提示升级（含 inquirer 重构）

## Why
当前版本输出仅展示版本号，缺少包名导致多包场景易混淆；同时更新流程与参数说明/帮助/提示交互分散不一致。通过统一输出格式、增加版本列表限制参数，并用 inquirer 重构参数系统，提升可读性与交互一致性。

## What Changes
- `--update` 与版本查询中，当前版本展示为 `<package.name>@<version>`
- 更新版本选项使用 `<package.name>@<version>` 展示，不再额外输出“线上版本”行
- 新增 `-l/--version-length <n>`，用于限制线上版本列表与更新选项列表长度
- `bin-home` 与 `binu` 的帮助/参数说明/提示统一改为 inquirer 交互

## Impact
- Affected specs: `cli-version-update`, `cli-arg-prompts`
- Affected code: `bin/cli.js`, `lib/*`（版本查询、更新流程、输出格式化、交互与帮助）
