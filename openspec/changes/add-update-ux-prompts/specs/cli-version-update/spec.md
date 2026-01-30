## ADDED Requirements
### Requirement: Update view version diff highlight
当用户运行 `bin-home <command> --update` 或 `bin-home <command> -u` 时，系统 MUST 基于本地版本与最新版本的差异级别给出“需要更新”提示，并按级别使用颜色区分：major 为红色、minor 为黄色、patch 及以下为绿色。

#### Scenario: major 差异提示为红色
- **WHEN** 本地版本为 1.2.3 且最新版本为 2.0.0
- **THEN** 输出包含“需要更新”的提示且使用红色

#### Scenario: minor 差异提示为黄色
- **WHEN** 本地版本为 1.2.3 且最新版本为 1.3.0
- **THEN** 输出包含“需要更新”的提示且使用黄色

#### Scenario: patch 差异提示为绿色
- **WHEN** 本地版本为 1.2.3 且最新版本为 1.2.4
- **THEN** 输出包含“需要更新”的提示且使用绿色

### Requirement: Already latest message with emoji
当用户运行 `bin-home <command> --update` 或 `bin-home <command> -u` 且本地版本等于最新版本时，系统 MUST 输出“很不错，你已经保持了最新”并包含 emoji。

#### Scenario: 已是最新版本
- **WHEN** 本地版本为 1.2.3 且最新版本为 1.2.3
- **THEN** 输出“很不错，你已经保持了最新”并包含 emoji

### Requirement: Prompt to run CLI after update
当用户通过 `--update` 完成更新并成功执行 `npm i -g <package.name>@<version>` 后，系统 MUST 询问用户是否立即执行当前 CLI。

#### Scenario: 用户确认立即执行
- **WHEN** 更新成功且用户确认立即执行
- **THEN** 运行目标 CLI 命令（不附加额外参数）

#### Scenario: 用户拒绝立即执行
- **WHEN** 更新成功且用户拒绝立即执行
- **THEN** 不执行目标 CLI 命令并正常退出