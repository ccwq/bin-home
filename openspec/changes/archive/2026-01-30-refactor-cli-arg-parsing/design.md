## Context
现有 CLI 参数解析逻辑分散在 `bin/cli.js` 与 `bin/binu.js`，存在重复解析与 `process.argv` 重写。计划通过 Commander 统一参数定义与解析，降低维护成本并提升一致性。

## Goals / Non-Goals
- Goals:
  - 提供单一的参数解析入口与默认值配置
  - `bin-home` 与 `binu` 复用同一解析结果
  - 不改变现有 CLI 行为与输出格式
- Non-Goals:
  - 不引入新的命令或交互流程
  - 不调整版本更新的业务逻辑

## Decisions
- Decision: 使用 Commander 作为参数解析库，集中定义选项、参数与默认值
- Decision: 将解析逻辑封装为共享模块，对外提供解析结果与规范化后的选项对象
- Decision: 保留 `binu` 作为独立入口，但通过共享模块注入默认 `update` 语义
- Alternatives considered:
  - 继续手写解析：可控但维护成本高，难以扩展
  - 仅在 `bin/cli.js` 使用 Commander：`binu` 仍需重复逻辑

## Risks / Trade-offs
- 引入新依赖可能带来体积与行为差异 → 通过测试覆盖与兼容配置（如允许未知参数）缓解

## Migration Plan
1) 增加 Commander 依赖与共享解析模块
2) 入口脚本切换到共享解析结果
3) 完善单测与文档

## Open Questions
- 是否需要保留对未知参数的静默忽略行为，或转为显式错误提示？
