const { Plugin, SettingTab, Component, EditorSuggest, I18n, Notice } =
  window[Symbol.for("typora-plugin-core@v2")];
const fs = window.reqnode("fs");

const MAX_SUGGESTIONS = 50;

// 解析用户配置的 BibTeX 文件列表，支持换行、逗号和分号分隔
function parseBibFileList(value) {
  return String(value || "")
    .split(/[\r\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function parseBibValue(rawValue) {
  if (!rawValue) return "";

  const value = normalizeWhitespace(rawValue);
  if (
    (value.startsWith("{") && value.endsWith("}")) ||
    (value.startsWith('"') && value.endsWith('"'))
  ) {
    return normalizeWhitespace(value.slice(1, -1));
  }

  return value;
}

// 这里使用轻量级 BibTeX 解析，只提取检索与展示所需的常见字段
function parseBibEntries(content, sourcePath) {
  const entries = [];
  const entryRegex = /@(\w+)\s*\{\s*([^,\s]+)\s*,([\s\S]*?)\n?\}\s*(?=@|$)/g;
  let match;

  while ((match = entryRegex.exec(content)) !== null) {
    const [, type, key, body] = match;
    const fields = {};
    const fieldRegex = /(\w+)\s*=\s*({(?:[^{}]|{[^{}]*})*}|"[^"]*"|[^,\n]+)\s*,?/g;
    let fieldMatch;

    while ((fieldMatch = fieldRegex.exec(body)) !== null) {
      fields[fieldMatch[1].toLowerCase()] = parseBibValue(fieldMatch[2]);
    }

    entries.push({
      key: key.trim(),
      type: type.toLowerCase(),
      title: fields.title || "",
      authors: fields.author || "",
      year: fields.year || fields.date || "",
      journal: fields.journal || fields.journaltitle || fields.booktitle || "",
      publisher: fields.publisher || "",
      sourcePath,
      searchText: normalizeWhitespace(
        [
          key,
          fields.title,
          fields.author,
          fields.year,
          fields.date,
          fields.journal,
          fields.journaltitle,
          fields.booktitle,
          fields.publisher,
        ].join(" "),
      ).toLowerCase(),
    });
  }

  return entries;
}

const i18n = new I18n({
  resources: {
    en: {
      commandInsert: "Insert BibTeX Citation",
      fileNotFound: "BibTeX file not found: ",
      noFilesConfigured: "Please configure at least one BibTeX file path.",
      loadError: "Failed to load BibTeX files: ",
      settingsSaved: "BibTeX file list updated.",
      settings: {
        bibFiles: {
          name: "BibTeX Files",
          desc: "Absolute BibTeX file paths separated by commas, semicolons, or new lines",
        },
      },
    },
  },
});

class BibCitationSettingTab extends SettingTab {
  constructor(plugin) {
    super();
    this.plugin = plugin;
  }

  get name() {
    return "BibTeX Citations";
  }

  onload() {
    this.render();
  }

  render() {
    const t = this.plugin.i18n.t;
    const plugin = this.plugin;

    this.addSetting((s) => {
      s.addName(t.settings.bibFiles.name);
      s.addDescription(t.settings.bibFiles.desc);
      s.addText((text) => {
        text.value = plugin.settings.get("bibFiles");
        text.placeholder =
          "/path/to/references.bib; /path/to/library.bib; /path/to/group.bib";
        text.onblur = () => {
          plugin.settings.set("bibFiles", text.value);
          plugin.resetCache();
          new Notice(t.settingsSaved);
        };
      });
    });
  }
}

class BibCitationSuggest extends EditorSuggest {
  constructor(app, plugin) {
    super();
    this.app = app;
    this.plugin = plugin;
    this.triggerText = "@";
  }

  findQuery(text) {
    const match = text.match(/@([^@\s]*)$/);
    return { isMatched: !!match, query: match ? match[1] : "" };
  }

  getSuggestions(query) {
    if (!query) return [];

    const normalizedQuery = query.toLowerCase();
    const entries = this.plugin.getBibEntries();

    return entries
      .filter((item) => item.searchText.includes(normalizedQuery))
      .sort((a, b) => {
        const aStarts = a.key.toLowerCase().startsWith(normalizedQuery) ? 0 : 1;
        const bStarts = b.key.toLowerCase().startsWith(normalizedQuery) ? 0 : 1;
        if (aStarts !== bStarts) return aStarts - bStarts;
        return a.key.localeCompare(b.key);
      })
      .slice(0, MAX_SUGGESTIONS);
  }

  getSuggestionId(item) {
    return item.key;
  }

  renderSuggestion(item) {
    let label = `@${item.key}`;
    const meta = [item.title, item.authors, item.year].filter(Boolean).join(" ");
    if (meta) label += ` — ${meta}`;
    return label.trim();
  }

  beforeApply(item) {
    return `@${item.key}`;
  }
}

class SuggestionManager extends Component {
  constructor(app, plugin) {
    super();
    this.app = app;
    this.plugin = plugin;
  }

  onload() {
    const suggest = new BibCitationSuggest(this.app, this.plugin);
    this.register(this.app.workspace.activeEditor.suggestion.register(suggest));
  }
}

const DEFAULT_SETTINGS = {
  bibFiles: "",
};

class BibCitationPlugin extends Plugin {
  constructor() {
    super(...arguments);
    this.i18n = i18n;
    this.bibCache = new Map();
  }

  resetCache() {
    this.bibCache.clear();
  }

  getBibEntries() {
    const bibFiles = parseBibFileList(this.settings.get("bibFiles"));

    if (!bibFiles.length) return [];

    const merged = [];
    const seenKeys = new Set();

    for (const bibFile of bibFiles) {
      if (!fs.existsSync(bibFile)) {
        console.warn(this.i18n.t.fileNotFound + bibFile);
        continue;
      }

      try {
        const stat = fs.statSync(bibFile);
        const cacheItem = this.bibCache.get(bibFile);

        if (!cacheItem || cacheItem.mtimeMs !== stat.mtimeMs) {
          const content = fs.readFileSync(bibFile, "utf8");
          this.bibCache.set(bibFile, {
            mtimeMs: stat.mtimeMs,
            entries: parseBibEntries(content, bibFile),
          });
        }

        const { entries } = this.bibCache.get(bibFile);
        for (const entry of entries) {
          if (seenKeys.has(entry.key)) continue;
          seenKeys.add(entry.key);
          merged.push(entry);
        }
      } catch (error) {
        console.error(this.i18n.t.loadError + bibFile, error);
      }
    }

    return merged;
  }

  async onload() {
    this.registerSettings(
      new window[Symbol.for("typora-plugin-core@v2")].PluginSettings(
        this.app,
        this.manifest,
        { version: 1 },
      ),
    );
    this.settings.setDefault(DEFAULT_SETTINGS);

    this.registerSettingTab(new BibCitationSettingTab(this));
    this.addChild(new SuggestionManager(this.app, this));
  }
}

export default BibCitationPlugin;
