# LAST_RUN

## 日期

- 2026-03-11

## 已完成

- 为插件接入外部 `CSL File` 设置，复用 `Path Base` 三种路径解析模式，并在侧边栏显示当前 CSL 配置
- 把 citation 渲染改为点击按钮时懒加载 `Citation.js`，并通过 `createRequire(import.meta.url)` 修复 Typora 渲染器无法解析插件本地 `@citation-js/*` 依赖的问题
- 修正同作者同年 citation 的稳定性：当前按整篇文档上下文与 bibliography 排序渲染，解决了 `2024a/2024b` 顺序错乱和跨段重复时丢失消歧的问题
- 本地补了一组 `CSL` 超级压力测试与 Markdown 输出脚本用于手工回归，但根据当前约定，整个 `tests/` 目录都只保留在本地，不参与版本控制
- 同步更新 `AGENTS.md` 与 `README.md`，移除把本地测试目录当成公开仓库接口的描述

## 主要方法与工具

- `git status --short --branch`
- `Get-Content README.md`
- `Get-Content AGENTS.md`
- `Get-Content LAST_RUN.md`
- `Get-ChildItem -Recurse .\\src -Filter *.js | ForEach-Object { node --check $_.FullName }`
- `npm install`
- `npm run test:csl-smoke`
- `apply_patch`
- Context7：核对 `Citation.js` / `@citation-js/plugin-csl` 的 citation 上下文与 bibliography 输出方式

## 当前任务

- 当前主线已从 BibTeX 检索扩展到 CSL citation 渲染，下一步最自然的功能是生成参考文献表，并与现有 `CSL File` 设置复用同一套样式来源
- 由于 `Render Citations` 会把原始 `[@key]` 替换成正文引用文本，后续 bibliography 工作流需要先明确是“一次性同时渲染 citation+bibliography”还是保留原始 key 的中间表示

## 下次继续

- 在 Typora 真机里继续回归 `CSL File` 路径配置、侧边栏按钮、citation 渲染与插件启动稳定性
- 设计 bibliography 生成入口、插入锚点和文档内 key 收集策略，优先避免与当前“替换式 citation 渲染”互相打架
- 若要保留本地测试脚本，继续只作为开发辅助工具使用，并保持 `.gitignore`、README 与项目记忆对这点的描述一致
