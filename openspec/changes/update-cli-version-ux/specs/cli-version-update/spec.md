## ADDED Requirements
### Requirement: Version fetch loading indicator
当需要从 npm 获取线上版本时，系统 MUST 在版本信息输出前提示正在加载。

#### Scenario: 获取线上版本时提示加载
- **WHEN** 用户运行 `bin-home -v` 或 `bin-home --version` 且需要请求线上版本
- **THEN** 输出一次“正在获取线上版本...”提示
- **THEN** 在版本信息输出完成后不再重复提示

#### Scenario: 更新流程中获取线上版本时提示加载
- **WHEN** 用户运行 `bin-home -u` 或 `bin-home --update` 且需要请求线上版本
- **THEN** 输出一次“正在获取线上版本...”提示
- **THEN** 在版本信息输出完成后不再重复提示

### Requirement: Update progress feedback
更新流程中，系统 MUST 给出更新中的状态提示，并在完成或失败时给出结果。

#### Scenario: 更新成功提示
- **WHEN** 用户触发更新并执行 `npm i -g <package.name>@<version>`
- **THEN** 在执行前输出“正在更新...”提示
- **THEN** 执行成功后输出“更新完成”提示

#### Scenario: 更新失败提示
- **WHEN** 用户触发更新并执行 `npm i -g <package.name>@<version>` 失败
- **THEN** 在执行前输出“正在更新...”提示
- **THEN** 执行失败后输出“更新失败”提示

## MODIFIED Requirements
### Requirement: Update flow with prompt
当用户运行 `bin-home -u` 或 `bin-home --update` 时，系统 MUST 展示版本信息并提示用户选择要更新的版本，默认更新 `latest`。

#### Scenario: 默认更新 latest
- **WHEN** 用户运行 `bin-home -u` 或 `bin-home --update`
- **THEN** 先按 `Requirement: Version info output` 的格式输出当前版本与线上版本
- **THEN** 若为交互终端，默认选中 `latest` 选项
- **THEN** 用户直接回车时，系统执行 `npm i -g <package.name>@latest`

#### Scenario: 键盘选择指定版本
- **WHEN** 用户在交互终端通过上下方向键选择某个版本并回车确认
- **THEN** 系统执行 `npm i -g <package.name>@<version>`

#### Scenario: 非交互环境回退为输入
- **WHEN** 标准输入非 TTY 或交互不可用
- **THEN** 系统提示用户输入版本号，若用户直接回车，默认值为 `latest`
- **THEN** 系统按输入版本执行 `npm i -g <package.name>@<version>`
