# Change: 重构 CLI 参数解析与设置逻辑（Commander 方案）

## Why
- 现有 `parseArgs` 与 `binu` 的 `process.argv` 重写存在重复与隐式耦合，扩展与测试成本高。
- 参数规范未集中定义，难以保证长期一致性与可维护性。
- 需要为后续交互与版本更新相关能力提供稳定的参数解析基座。

## What Changes
- 引入 Commander 作为统一的参数解析入口，集中定义选项与默认值。
- 提取共享的参数获取/设置逻辑为独立模块，`bin-home` 与 `binu` 复用同一解析结果。
- 保持现有 CLI 行为与输出格式不变，仅重构实现方式。
- 补充参数解析与入口行为的单元测试。

## Impact
- Affected specs: 新增能力 `parse-cli-args`
- Affected code: `bin/cli.js`, `bin/binu.js`, `lib/` 新模块，`test/`，`package.json`
