# LAST_RUN

## 日期

- 2026-03-11

## 已完成

- 修正当前文档引用统计规则，改为按闭合右方括号回扫同一行最近左方括号，只统计真正闭合且 citation key 全部合法的引用块
- 为文献库缓存补充合法 citation key 集合缓存，避免侧边栏每次统计时重复构建 key 集合
- 为侧边栏增加非法 citation key 提示，并让输入或删除 `]` 时在下一帧立即刷新当前文档引用统计
- 同步 `AGENTS.md` 项目记忆，并准备 `v0.2.5` patch 发布文件

## 主要方法与工具

- `git status --short --branch`
- `git log --oneline --decorate -n 12`
- `Get-Content AGENTS.md`
- `Get-Content CHANGELOG.md`
- `Get-ChildItem -Recurse .\\src -Filter *.js | ForEach-Object { node --check $_.FullName }`
- `apply_patch`

## 当前任务

- 当前正在发布 `v0.2.5`，主要覆盖当前文档引用统计语义收敛、合法 key 缓存复用与 `]` 驱动的即时刷新
- 版本文件、说明文档与项目记忆需要和这轮 patch 变更保持一致

## 下次继续

- 在 Typora 中手工回归 `[@key` 补全后立刻输入 `]`、删除 `]`、非法 citation key 报错与嵌套残缺方括号场景
- 若继续细化引用统计，优先明确 `[note [@alpha]]` 这类嵌套文本是否应计入统计，并保持 README 与 AGENTS 的描述一致
