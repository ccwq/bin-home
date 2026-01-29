## ADDED Requirements
### Requirement: binu update shorthand
系统 MUST 支持 binu 命令作为 bin-home --update 的缩写形式。

#### Scenario: 以 binu 触发更新
- **WHEN** 用户运行 binu codex
- **THEN** 系统执行与 bin-home codex --update 等价的更新流程

### Requirement: binu help output
当用户未提供参数或使用帮助参数时，系统 MUST 输出 binu 命令帮助说明。

#### Scenario: 无参数输出帮助
- **WHEN** 用户运行 binu
- **THEN** 输出帮助信息
- **THEN** 帮助中说明 binu 是 bin-home some-cli --update 的缩写
- **THEN** 帮助中说明该命令的功能与用法
- **THEN** 帮助中提供 1 个示例

#### Scenario: 使用 -h/--help 输出帮助
- **WHEN** 用户运行 binu -h
- **THEN** 输出与无参数时一致的帮助信息
- **WHEN** 用户运行 binu --help
- **THEN** 输出与无参数时一致的帮助信息
