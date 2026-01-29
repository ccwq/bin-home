# Change: Add binu update command alias

## Why
bin-home --update 使用频繁，增加 binu 简化常见更新操作，降低输入成本。

## What Changes
- 新增 binu 命令：binu <command> 等价于 bin-home <command> --update
- 需要在不加参数或者输入--help/-h时，打印帮助信息和说明, 需要说明这是bin-home some-cli --update命令的缩写, 同时说明这个命令的功能.以及如何使用, 给出1个例子

## Impact
- Affected specs: cli-version-update
- Affected code: bin/cli.js, lib/* (参数解析与命令路由)
