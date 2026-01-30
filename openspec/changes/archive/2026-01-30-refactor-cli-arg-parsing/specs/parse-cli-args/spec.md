## ADDED Requirements
### Requirement: CLI 选项解析一致性
系统 MUST 以统一的规则解析 `bin-home` 的选项与参数，并返回规范化后的结果（包含 commandName、help、version、update、open、versionLength）。

#### Scenario: 解析短/长选项与默认值
- **WHEN** 用户运行 `bin-home codex -v -l 10`
- **THEN** `commandName` 为 `codex`
- **THEN** `version` 为 `true`
- **THEN** `versionLength` 为 `10`
- **WHEN** 用户运行 `bin-home codex --version-length 6`
- **THEN** `versionLength` 为 `6`
- **WHEN** 用户未提供 `-l/--version-length`
- **THEN** `versionLength` 默认值为 `6`

### Requirement: 无命令场景的参数处理
当用户仅使用版本/更新选项而未提供命令名时，系统 MUST 使用自身包信息作为解析结果。

#### Scenario: 仅使用版本参数
- **WHEN** 用户运行 `bin-home -v`
- **THEN** 系统读取 `package.json` 中的 `name` 与 `version`
- **THEN** 后续版本输出基于工具自身信息

#### Scenario: 仅使用更新参数
- **WHEN** 用户运行 `bin-home --update`
- **THEN** 系统读取 `package.json` 中的 `name` 与 `version`
- **THEN** 后续更新流程基于工具自身信息
