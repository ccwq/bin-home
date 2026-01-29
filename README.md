# bin-home

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
# 显示自身版本与线上版本
bin-home --version

# 显示指定命令对应包的版本信息
bin-home codex --version

# 进入更新流程（默认 latest）
bin-home --update

# 使用 binu 进行快捷更新
binu codex
```

示例输出：

```
当前版本: 0.1.0
线上版本: 0.1.0
请输入要更新的版本 (默认 latest):
```

指定命令的更新示例：

```bash
bin-home codex --update
```

binu 的等价写法：

```bash
binu codex
```

示例输出：

```
当前版本: 0.72.0
线上版本: 0.92.0-alpha.9,0.92.0-alpha.8,0.92.0-alpha.7,0.92.0-alpha.5,0.92.0-alpha.4,0.92.0-alpha.3
请输入要更新的版本 (默认 latest):
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

- `--help`, `-h`: Show help
- `--version`, `-v`: Show version
- `--open`, `-o`: Open npm package page in browser

## Publishing

To publish to npm and GitHub:

1. Update `package.json` metadata (name, version, repository, author).
2. Create a GitHub repository and push the code.
3. Run `npm publish`.

---

# bin-home（中文）

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

### 选项

- `--help`, `-h`: 显示帮助
- `--version`, `-v`: 显示版本号
- `--open`, `-o`: 打开 npm 包页面

## 发布说明

发布到 npm 和 GitHub 的步骤：

1. 更新 `package.json` 元数据（name、version、repository、author）。
2. 创建 GitHub 仓库并推送代码。
3. 运行 `npm publish`。
