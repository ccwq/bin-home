<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# Repository Guidelines

## 项目结构与模块组织

- `bin/`: CLI 入口（例如 `bin/cli.js`），负责参数解析与交互输出。
- `lib/`: 核心逻辑模块（命令校验、包查找、仓库解析、输出格式化）。
- `test/`: Node 内置测试运行器的用例，按模块拆分。
- `README.md`: 使用说明与发布流程。

## 构建、测试与本地开发命令

- `npm install`: 安装依赖。
- `node bin/cli.js <command> [--open]`: 本地直接运行 CLI。
- `npm test`: 运行 `node --test`，执行 `test/*.test.js`。

## 代码风格与命名约定

- JavaScript 使用 CommonJS（`require/module.exports`）。
- 缩进 2 个空格、语句以分号结尾、字符串使用双引号。
- 文件命名采用 `camelCase`（如 `commandValidator.js`），测试文件使用 `<模块名>.test.js`。
- 目前未配置 lint/format 工具，保持与现有文件一致即可。

## 测试指南

- 使用 Node 内置测试（`node --test`）。
- 测试文件放在 `test/`，命名为 `*.test.js`。
- 新增功能需补充对应模块测试，优先覆盖错误分支与 CLI 输出格式。

## 提交与 PR 指南

- 当前 Git 历史仅有 `init:`，建议沿用 `type: summary` 形式（例如 `feat: add flag parsing`、`fix: handle missing command`）。
- PR 需说明变更动机、关键实现点与测试结果；如涉及 CLI 输出，附上示例输出片段。

## 运行环境与配置提示

- 目标运行环境为 Node.js `>=14`（见 `package.json`）。
- 本项目无需额外配置或密钥，避免提交本地环境文件。
