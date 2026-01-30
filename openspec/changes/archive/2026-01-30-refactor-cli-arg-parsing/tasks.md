## 1. 实现
- [x] 1.1 调研现有 CLI 参数解析路径（`bin/cli.js` 与 `bin/binu.js`）并确认需要保持的行为
- [x] 1.2 引入 Commander 依赖并设计共享解析模块（例如 `lib/cliOptions.js`）
- [x] 1.3 以共享解析结果重构 `bin/cli.js` 入口逻辑，移除手写 `parseArgs`
- [x] 1.4 重构 `bin/binu.js` 为调用共享解析逻辑并设定默认 `update` 行为
- [x] 1.5 补充参数解析与入口行为单测（短/长选项、默认值、无命令场景）
- [ ] 1.6 更新 README 中的参数说明（如有新增/调整）
