## ADDED Requirements
### Requirement: Version info output
当用户运行 `bin-home -v` 或 `bin-home --version` 时，系统 MUST 输出当前版本与线上版本信息。

#### Scenario: 输出当前版本与线上版本
- **WHEN** 用户运行 `bin-home -v` 或 `bin-home --version`
- **THEN** 输出工具自身的版本
- **WHEN** 用户运行 `bin-home codex -v` 或 `bin-home codex --version`
- **THEN** 第一行输出 `当前版本: <本地版本>`（读取 `package.json` 的 `version`）
- **THEN** 第二行输出 `线上版本: <v1>,<v2>,<v3>,<v4>,<v5>,<v6>`，版本列表来源于 `npm view <package.name> versions`
- **THEN** 线上版本按从新到旧排序，最新版本在第一个

### Requirement: Update flow with prompt
当用户运行 `bin-home -u` 或 `bin-home --update` 时，系统 MUST 展示版本信息并提示输入要更新的版本，默认更新 `latest`。

#### Scenario: 默认更新 latest
- **WHEN** 用户运行 `bin-home -u` 或 `bin-home --update`
- **THEN** 先按 `Requirement: Version info output` 的格式输出当前版本与线上版本
- **THEN** 系统提示用户输入版本号，若用户直接回车，默认值为 `latest`
- **THEN** 系统执行 `npm i -g <package.name>@latest`

#### Scenario: 用户输入指定版本
- **WHEN** 用户在提示中输入某个版本号（例如 `1.2.3`）
- **THEN** 系统执行 `npm i -g <package.name>@1.2.3`
