## ADDED Requirements
### Requirement: Inquirer-based help output
当用户请求帮助或参数说明时，系统 MUST 使用 inquirer 渲染并展示帮助内容。

#### Scenario: bin-home 显示帮助
- **WHEN** 用户运行 `bin-home -h` 或 `bin-home --help`
- **THEN** 使用 inquirer 展示帮助内容（命令简介、参数说明、至少 1 个示例）

#### Scenario: binu 显示帮助
- **WHEN** 用户运行 `binu` 或 `binu -h` 或 `binu --help`
- **THEN** 使用 inquirer 展示与 binu 相关的帮助内容（命令简介、参数说明、至少 1 个示例）

### Requirement: Inquirer-based prompts
当流程需要用户交互选择或输入时，系统 MUST 使用 inquirer 提示并收集输入。

#### Scenario: 版本更新需要选择版本
- **WHEN** 用户运行 `bin-home --update` 或 `binu <command>`
- **THEN** 系统使用 inquirer 提示用户选择或输入版本
