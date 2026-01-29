## MODIFIED Requirements
### Requirement: Version info output
当用户运行 `bin-home -v` 或 `bin-home --version` 时，系统 MUST 输出当前版本与线上版本信息。

#### Scenario: 输出当前版本与线上版本
- **WHEN** 用户运行 `bin-home -v` 或 `bin-home --version`
- **THEN** 输出工具自身的版本
- **WHEN** 用户运行 `bin-home codex -v` 或 `bin-home codex --version`
- **THEN** 第一行输出 `当前版本: <package.name>@<本地版本>`（读取目标包 `package.json` 的 `version`）
- **THEN** 第二行输出 `线上版本: <v1>,<v2>,<v3>,<v4>,<v5>,<v6>`，版本列表来源于 `npm view <package.name> versions`
- **THEN** 线上版本按从新到旧排序，最新版本在第一个
- **THEN** 若提供 `-l/--version-length <n>`，线上版本列表仅展示前 <n> 个

### Requirement: Update flow with prompt
当用户运行 `bin-home -u` 或 `bin-home --update` 时，系统 MUST 展示版本信息并提示输入要更新的版本，默认更新 `latest`。

#### Scenario: 默认更新 latest
- **WHEN** 用户运行 `bin-home -u` 或 `bin-home --update`
- **THEN** 输出 `当前版本: <package.name>@<本地版本>`
- **THEN** 不输出 `线上版本: ...` 行
- **THEN** 系统使用版本选项列表提示用户选择要更新的版本，默认值为 `latest`
- **THEN** 版本选项以 `<package.name>@<version>` 的格式展示
- **THEN** 若提供 `-l/--version-length <n>`，版本选项仅提供前 <n> 个版本
- **THEN** 系统执行 `npm i -g <package.name>@latest`

#### Scenario: 用户输入指定版本
- **WHEN** 用户在提示中选择某个版本（例如 `1.2.3`）
- **THEN** 系统执行 `npm i -g <package.name>@1.2.3`

### Requirement: binu update shorthand
系统 MUST 支持 binu 命令作为 bin-home --update 的缩写形式。

#### Scenario: 以 binu 触发更新
- **WHEN** 用户运行 binu codex
- **THEN** 系统执行与 bin-home codex --update 等价的更新流程

#### Scenario: 以 binu 传递 version-length
- **WHEN** 用户运行 binu codex -l 10 或 binu codex --version-length 10
- **THEN** 系统执行与 bin-home codex --update --version-length 10 等价的更新流程
