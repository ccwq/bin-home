## Context
当前 CLI 交互输出由多处逻辑拼接，版本信息与帮助输出风格不一致；更新流程还存在“线上版本”重复展示。需求要求统一版本输出格式与交互方式，并引入 inquirer 统一参数说明/帮助/提示。

## Goals / Non-Goals
- Goals:
  - 版本输出包含包名，减少歧义
  - 通过 `-l/--version-length` 控制列表长度
  - 统一帮助与提示的交互方式为 inquirer
- Non-Goals:
  - 不改变实际安装命令与包解析逻辑
  - 不引入与 inquirer 无关的额外交互框架

## Decisions
- Decision: 使用 inquirer 统一命令帮助、参数说明与交互提示
- Decision: `--update` 流程不再输出“线上版本”行，版本列表改为带包名的选项
- Decision: `-l/--version-length <n>` 同时影响版本查询与更新选项列表

## Risks / Trade-offs
- inquirer 引入后对非交互环境可能需要兼容处理 → 在实现阶段评估并保留退化输出路径
- 版本列表默认全量可能较长 → 通过 `-l/--version-length` 提供限制手段

## Migration Plan
- 增加依赖并实现 inquirer 版本的帮助/提示
- 保持原有命令入口不变，逐步替换输出逻辑
- 补齐测试与文档示例

## Open Questions
- 是否需要为非交互环境强制回退到静态帮助输出？
