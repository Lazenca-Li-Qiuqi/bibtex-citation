const { I18n } = window[Symbol.for("typora-plugin-core@v2")];

const en = {
  pluginName: "BibTeX Citations",
  fileNotFound: "BibTeX file not found: ",
  loadError: "Failed to load BibTeX files: ",
  cslFileNotFound: "CSL file not found: ",
  cslPathRequired: "Please configure a CSL file path first.",
  settingsSaved: "Settings updated.",
  emptyPathWarning: "Please enter a BibTeX file path first.",
  absolutePathRequired:
    "This path mode only accepts absolute file paths.",
  sidebar: {
    title: "BibTeX Citations",
    heading: "BibTeX Citations",
    description:
      "Review the current BibTeX configuration, indexed entries, and quick actions.",
    pathBaseLabel: "Path Base",
    cslFileLabel: "CSL File",
    configuredFilesLabel: "Configured Files",
    indexedEntriesLabel: "Indexed Entries",
    citedEntriesLabel: "Cited In Current Doc",
    refreshButton: "Refresh Cache",
    renderButton: "Render Citations",
    insertBibliographyButton: "Insert Bibliography",
    empty: "No BibTeX files are configured yet.",
    unavailable: "Refresh needed",
    loadErrorPrefix: "Index refresh failed: ",
    invalidCitationPrefix: "Current document contains an unknown citation key: ",
    renderErrorPrefix: "Citation rendering failed: ",
    insertBibliographyErrorPrefix: "Bibliography insertion failed: ",
    renderReloadUnavailable: "The current Typora runtime does not expose a document reload API.",
    renderNoChanges:
      "No strictly valid CSL citation blocks were found. This action currently only processes patterns like [@key] or [@a; @b].",
    renderSuccess: "Rendered {blocks} citation blocks ({keys} keys).",
    insertBibliographyNoChanges:
      "No strictly valid CSL citation keys were found. Insert Bibliography currently only works while the document still contains patterns like [@key] or [@a; @b].",
    insertBibliographySuccess: "Inserted bibliography for {keys} cited keys.",
    bibliographyHeading: "References",
    triggerHint:
      "Type [@query] in the editor to search citations from the configured files.",
    duplicateHint:
      "When citation keys are duplicated, the earlier configured file wins.",
    citationCountHint:
      "The current-document count shows both unique citation keys and total citation occurrences found in bracket citations.",
    renderHint:
      "Render Citations replaces strictly valid CSL citation blocks such as [@key] or [@a; @b] with in-text citations using the configured CSL file. If any closed citation block contains an unknown key, the action stops with an error.",
    insertBibliographyHint:
      "Insert Bibliography appends or updates a managed bibliography block at the end of the document, based on strictly valid citation blocks that still contain @keys. If any closed citation block contains an unknown key, the action stops with an error.",
    citationCountFormat: "{unique} unique / {total} total",
    filesTitle: "BibTeX Files",
  },
  settings: {
    language: {
      name: "Display Language",
      desc: "Choose the display language used by this plugin.",
      en: "English",
      zhCn: "简体中文",
    },
    pathBase: {
      name: "Path Base",
      desc: "Choose how non-absolute BibTeX and CSL file paths should be resolved.",
      markdown: "Relative to the current Markdown file",
      typora: "Relative to the folder currently opened in Typora",
      absolute: "Absolute paths only",
    },
    bibFiles: {
      name: "BibTeX Files",
      desc: "Manage BibTeX file paths one by one. The order controls duplicate citation key priority.",
      add: "Add BibTeX File",
      empty: "No BibTeX files configured yet.",
      placeholder: "./references.bib",
      remove: "Remove",
    },
    cslFile: {
      name: "CSL File",
      desc: "Configure a single CSL style file used to render in-text citations and the future bibliography.",
      placeholder: "./styles/american-meteorological-society.csl",
      clear: "Clear",
    },
  },
};

const zhCn = {
  pluginName: "BibTeX 引用",
  fileNotFound: "未找到 BibTeX 文件：",
  loadError: "加载 BibTeX 文件失败：",
  cslFileNotFound: "未找到 CSL 文件：",
  cslPathRequired: "请先配置一个 CSL 文件路径。",
  settingsSaved: "设置已更新。",
  emptyPathWarning: "请先输入 BibTeX 文件路径。",
  absolutePathRequired: "当前路径模式仅接受绝对文件路径。",
  sidebar: {
    title: "BibTeX 引用",
    heading: "BibTeX 引用",
    description: "查看当前 BibTeX 配置、索引状态与快捷操作。",
    pathBaseLabel: "路径基准",
    cslFileLabel: "CSL 文件",
    configuredFilesLabel: "已配置文件数",
    indexedEntriesLabel: "已索引条目数",
    citedEntriesLabel: "当前文档引用统计",
    refreshButton: "刷新缓存",
    renderButton: "渲染引用",
    insertBibliographyButton: "插入参考文献",
    empty: "暂未配置任何 BibTeX 文件。",
    unavailable: "待刷新",
    loadErrorPrefix: "刷新索引失败：",
    invalidCitationPrefix: "当前文档包含未收录于文献库的 citation key：",
    renderErrorPrefix: "渲染引用失败：",
    insertBibliographyErrorPrefix: "插入参考文献失败：",
    renderReloadUnavailable: "当前 Typora 运行时没有暴露文档重载接口。",
    renderNoChanges:
      "没有发现可渲染的严格合法 CSL 引用块。当前只处理 [@key] 或 [@a; @b] 这类形式。",
    renderSuccess: "已渲染 {blocks} 个引用块，共 {keys} 个 key。",
    insertBibliographyNoChanges:
      "没有发现可用于生成参考文献的严格合法 citation key。当前只有在文档里还保留 [@key] 或 [@a; @b] 这类形式时，才能插入参考文献。",
    insertBibliographySuccess: "已为 {keys} 个引用 key 插入参考文献。",
    bibliographyHeading: "参考文献",
    triggerHint: "在编辑器中输入 [@query] 即可从已配置文件中检索引用。",
    duplicateHint: "当 citation key 重复时，会优先采用更靠前配置的文件。",
    citationCountHint:
      "当前文档统计基于方括号引用中的 citation key，同时显示唯一文献数与总出现次数。",
    renderHint:
      "渲染引用会把严格合法的 CSL 引用块，例如 [@key] 或 [@a; @b]，替换成按当前配置的 CSL 文件生成的文中引用。若任意闭合引用块包含未知 key，本次操作会直接报错并停止。",
    insertBibliographyHint:
      "插入参考文献会在文档末尾追加或更新一个受控的参考文献块，依据的是当前文档中仍保留 @key 的严格合法 citation block。若任意闭合引用块包含未知 key，本次操作会直接报错并停止。",
    citationCountFormat: "共 {unique} 条 / {total} 次",
    filesTitle: "BibTeX 文件",
  },
  settings: {
    language: {
      name: "显示语言",
      desc: "选择此插件使用的显示语言。",
      en: "English",
      zhCn: "简体中文",
    },
    pathBase: {
      name: "路径基准",
      desc: "选择非绝对 BibTeX 与 CSL 路径的解析基准。",
      markdown: "相对当前 Markdown 文件",
      typora: "相对 Typora 当前打开的文件夹",
      absolute: "仅接受绝对路径",
    },
    bibFiles: {
      name: "BibTeX 文件",
      desc: "逐条管理 BibTeX 文件路径，顺序会影响重复 citation key 的优先级。",
      add: "添加 BibTeX 文件",
      empty: "暂未配置任何 BibTeX 文件。",
      placeholder: "./references.bib",
      remove: "删除",
    },
    cslFile: {
      name: "CSL 文件",
      desc: "配置一个单独的 CSL 样式文件，用于渲染文中引用以及后续的参考文献表。",
      placeholder: "./styles/american-meteorological-society.csl",
      clear: "清空",
    },
  },
};

export function createI18n(displayLanguage = "zh-cn") {
  return new I18n({
    userLang: displayLanguage,
    resources: {
      en,
      zh: zhCn,
      "zh-cn": zhCn,
    },
  });
}
