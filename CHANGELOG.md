# CHANGELOG

## 0.1.0 - 2026-03-09

- 首次发布 `bibtex-citation` Typora Community Plugin
- 从早期实现逐步收敛为 BibTeX-only 工作流，不再依赖外部文献管理器或原生构建步骤
- 支持从一个或多个本地 `.bib` 文件检索文献，并在 Typora 中输入 `@query` 时提供候选项
- 支持按 `citation key`、标题、作者、年份、期刊等字段搜索，并在确认后插入 `@citationKey`
- 支持多个 BibTeX 文件路径配置，重复 `citation key` 以更靠前的配置项为准
- 增加相对路径基准模式，可在“相对当前 Markdown 文件”“相对 Typora 打开的目录”“仅接受绝对路径”之间切换
- 修复 Typora 设置页兼容性问题与插件加载显示问题
- 同步中文 README、项目记忆与本地接手文档
