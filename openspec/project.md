# Project Context

## Purpose
提供一个 CLI 工具，根据命令名定位对应的全局 npm 包，并输出 npm 页面与仓库信息，帮助用户快速找到需要安装/管理的包。

## Tech Stack
- Node.js CLI（>=14）
- JavaScript（CommonJS）
- 依赖：`which`（查找可执行文件）、`open`（打开浏览器）
- Node 内置测试运行器（`node --test`）

## Project Conventions

### Code Style
- 2 空格缩进、语句以分号结尾、字符串使用双引号
- CommonJS（`require`/`module.exports`）
- 文件命名 `camelCase`，测试文件为 `<模块名>.test.js`
- 适量注释，聚焦复杂逻辑/边界条件

### Architecture Patterns
- `bin/cli.js` 负责参数解析与 CLI 入口
- `lib/` 提供可复用的核心模块（命令校验、包查找、仓库解析、输出格式化）
- 异步 IO 使用 `async/await`，错误通过带 `exitCode` 的 Error 传递并在入口处理

### Testing Strategy
- 使用 `node --test`，测试文件位于 `test/`
- 新功能需补充单测，优先覆盖错误分支与 CLI 输出格式

### Git Workflow
- 提交信息采用 `type: summary`（例如 `feat: add flag parsing`）
- 分支策略未强制，默认在主分支或短期分支上工作

## Domain Context
- 通过 `npm ls -g --depth=0 --json` 与 `npm root -g` 获取全局包清单与路径
- 读取包的 `package.json` 中 `bin` 字段匹配命令名
- 兼容 `bin` 为字符串或对象两种形式
- 解析仓库信息时优先规范化 GitHub URL
- 针对 Volta 环境提供额外解析（`volta which <command>`）

## Important Constraints
- 运行环境为 Node.js >=14
- CLI 输出需清晰稳定，避免破坏现有输出格式
- 不引入不必要的复杂依赖或框架

## External Dependencies
- `npm` CLI（读取全局包信息）
- `open`（打开 npm 包页面）
- `which`（解析系统 PATH 中的命令）
- 可选：`volta`（仅在已安装时使用）
