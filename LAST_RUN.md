# LAST_RUN

## 日期

- 2026-03-11

## 已完成

- 为插件发布 `v0.2.7`，版本文件、CHANGELOG、README 与项目记忆已同步到 bibliography MVP 阶段
- 为 bibliography 增加 MVP：当前可从文档中仍保留 `@key` 的严格合法 citation block 生成或更新文末受控参考文献块
- 为 bibliography 补齐第一批关键 CSL 映射字段，优先修复会议论文与章节类条目缺失 `booktitle`、`editor`、卷期页后只剩题名的问题
- 将 CSL 文档改写行为统一为“遇到非法 citation key 直接报错并停止”，不再对混合合法/非法 key 做跳过式容错
- 明确 bibliography 的长期路线：不要尝试从已经渲染完成的 citation 文本逆向恢复 `@key`，后续应优先保留原始 key 作为持久真源

## 主要方法与工具

- `git status --short --branch`
- `Get-Content AGENTS.md`
- `Get-Content LAST_RUN.md`
- `Get-Content README.md`
- `Get-ChildItem -Recurse .\\src -Filter *.js | ForEach-Object { node --check $_.FullName }`
- 本地 `node --input-type=module -` 最小样例回归：验证 `apa.csl` / `nature.csl` citation、bibliography 与 `inproceedings` 条目输出
- `apply_patch`
- Context7：核对 `Citation.js` / `@citation-js/plugin-csl` 的排序、HTML 输出与 bibliography 机制

## 当前任务

- bibliography 的基础插入能力已经接通，但当前仍与“替换式 citation 渲染”存在结构冲突：一旦先渲染 citation，文档里就不再保留原始 `@key`
- 下一步重点不是继续做逆向解析，而是设计如何在 citation 渲染后仍然保留原始 key，供 bibliography 与后续更新复用

## 下次继续

- 设计 citation 的受控块格式，在渲染后保留原始 `[@key]` 作为持久真源
- 在 Typora 真机中回归 bibliography 受控块的插入、重复更新、非法 key 报错与会议论文条目输出
- 若继续扩展 CSL 能力，优先评估 locator、复杂 citation cluster 与 note-style 的支持方式，并同步更新 README 的支持矩阵
