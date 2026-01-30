# Change: 优化 --update 版本提示与更新后交互

## Why
当前 --update 仅展示版本列表与输入提示，缺少“是否需要更新”的直观反馈与更新后继续执行的引导，影响可用性。

## What Changes
- 在 --update 版本信息界面基于语义版本差异给出“需要更新”提示，并使用颜色区分 major/minor/patch 等级
- 当已是最新版本时，输出“很不错，你已经保持了最新”并带 emoji
- 更新成功后询问用户是否立即执行当前 CLI

## Impact
- Affected specs: cli-version-update
- Affected code: bin/cli.js, lib/* (version 输出与更新流程相关模块)