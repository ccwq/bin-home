# bin-home

[查看中文](#bin-home中文)

bin-home is a CLI tool that finds which global npm package provides a given
command. It helps when you know the command name (for example, `codex`) but not
the package you need to install or manage (for example, `@openai/codex`).

## Installation

```bash
npm install -g bin-home
```

## Usage

```bash
bin-home <command> [--open]
```

### Version & Update

```bash
# Show self version and online versions
bin-home --version

# Show package version info for a specific command
bin-home codex --version

# Start update process (defaults to latest)
bin-home --update

# Limit the number of online versions shown (default: 6)
bin-home codex --version -l 10

# Quick update using binu
binu codex
```

Example output:

```
Current version: bin-home@0.2.0
Online version: 0.2.0,0.1.0
```

Update process example (no extra "Online version" line):

```bash
binu codex
```

Example output:

```
Current version: @openai/codex@0.72.0
? Select version to update (Arrow keys to select, Enter to confirm, Esc to cancel): (Use arrow keys)
> latest
  @openai/codex@0.92.0-alpha.9
  @openai/codex@0.92.0-alpha.8
  @openai/codex@0.92.0-alpha.7
  @openai/codex@0.92.0-alpha.5
  @openai/codex@0.92.0-alpha.4
  @openai/codex@0.92.0-alpha.3
```

### Examples

```bash
bin-home codex
```

Expected output:

```text
npm: @openai/codex
npm url: https://www.npmjs.com/package/@openai/codex
github: https://github.com/openai/codex
```

Open npm package page automatically:

```bash
bin-home codex --open
```

### Options

- `--help`, `-h`: Show help (Interactive menu)
- `--version`, `-v`: Show version
- `--open`, `-o`: Open npm package page in browser
- `--update`, `-u`: Update to specified version
- `-l, --version-length <n>`: Limit online version list length (default: 6)

### Debug Logs

Set `BIN_HOME_DEBUG=1` to print internal diagnostics to stderr with prefix
`[bin-home:debug]`.

These logs are useful for troubleshooting update/version mismatches, especially
in mixed environments (for example npm global + Volta).

Common scopes:

- `packageFinder`: package resolution source and selected path
- `version`: local/online version resolution and mismatch checks
- `volta`: Volta detection details
- `update`: selected update strategy (`npm` or `volta`)
- `verify`: runtime command path/version probes before and after update

Examples:

```bash
# Linux/macOS
BIN_HOME_DEBUG=1 node ./bin/binu.js iflow

# Windows PowerShell
$env:BIN_HOME_DEBUG = "1"
node .\bin\binu.js iflow
```

### Troubleshooting Flow

When update behavior is not as expected, use this quick checklist with debug logs:

1. Check command routing
   - Look at `packageFinder.command resolution context`
   - Confirm `commandPath` matches the command you actually run
2. Check package source
   - Look for `preferred volta package for command` or npm match logs
   - Verify the selected package/version is what you expect
3. Check update strategy
   - Look at `update.selected update strategy`
   - Ensure strategy is `volta` when command is Volta-managed
4. Check runtime verification
   - Compare `verify.runtime version probe result` with expected target version
   - If mismatch remains, run `where <command>` / `volta list <command>` manually

## Publishing

To publish to npm and GitHub:

1. Update `package.json` metadata (name, version, repository, author).
2. Create a GitHub repository and push the code.
3. Run `npm publish`.

---

# bin-home（中文）

[View English](#bin-home)

bin-home 是一个 CLI 工具，用于查找某个命令来自哪个全局 npm 包。它解决了
“知道命令名但不知道包名”的痛点，比如命令是 `codex`，但包名是
`@openai/codex`。

## 安装

```bash
npm install -g bin-home
```

## 使用方法

```bash
bin-home <命令名> [--open]
```

### 示例

```bash
bin-home codex
```

预期输出：

```text
npm: @openai/codex
npm url: https://www.npmjs.com/package/@openai/codex
github: https://github.com/openai/codex
```

自动打开 npm 包页面：

```bash
bin-home codex --open
```

快速进入更新流程（`bin-home <命令> --update` 的缩写）：

```bash
binu codex
```

示例输出：

```
当前版本: @openai/codex@0.72.0
? 请选择要更新的版本（上下方向键选择，回车确认，Esc 取消）： (Use arrow keys)
> latest
  @openai/codex@0.92.0-alpha.9
  @openai/codex@0.92.0-alpha.8
  @openai/codex@0.92.0-alpha.7
  @openai/codex@0.92.0-alpha.5
  @openai/codex@0.92.0-alpha.4
  @openai/codex@0.92.0-alpha.3
```

### 选项

- `--help`, `-h`: 显示帮助 (交互式菜单)
- `--version`, `-v`: 显示版本号
- `--open`, `-o`: 打开 npm 包页面
- `--update`, `-u`: 更新到指定版本
- `-l, --version-length <n>`: 限制显示的线上版本数量 (默认: 6)

### 调试日志

设置 `BIN_HOME_DEBUG=1` 后，工具会向 stderr 输出内部诊断日志，前缀为
`[bin-home:debug]`。

这类日志可用于排查版本/更新链路问题，尤其是 npm 全局与 Volta 混用场景。

常见日志范围：

- `packageFinder`: 包解析来源与命中路径
- `version`: 本地/线上版本解析与不一致检测
- `volta`: Volta 识别细节
- `update`: 更新策略选择（`npm` 或 `volta`）
- `verify`: 更新前后运行态命令路径与版本探测

示例：

```bash
# Linux/macOS
BIN_HOME_DEBUG=1 node ./bin/binu.js iflow

# Windows PowerShell
$env:BIN_HOME_DEBUG = "1"
node .\bin\binu.js iflow
```

### 排障流程

当更新行为与预期不一致时，可按下面步骤结合调试日志快速定位：

1. 先看命令路由
   - 查看 `packageFinder.command resolution context`
   - 确认 `commandPath` 与你实际执行的命令一致
2. 再看包解析来源
   - 关注 `preferred volta package for command` 或 npm 命中日志
   - 确认最终使用的包与版本符合预期
3. 再看更新策略
   - 查看 `update.selected update strategy`
   - 若命令由 Volta 管理，应为 `volta`
4. 最后看运行态校验
   - 对比 `verify.runtime version probe result` 与目标版本
   - 如仍不一致，手动执行 `where <命令>` / `volta list <命令>` 交叉确认

## 发布说明

发布到 npm 和 GitHub 的步骤：

1. 更新 `package.json` 元数据（name、version、repository、author）。
2. 创建 GitHub 仓库并推送代码。
3. 运行 `npm publish`。
