import { parseBibEntries } from "./parser.js";
import { resolveBibFilePath } from "./path-resolver.js";
import { parseBibFileList } from "./settings.js";

const fs = window.reqnode("fs");

/**
 * 功能：管理 BibTeX 文件读取、mtime 缓存与去重合并逻辑。
 * 输入：构造时接收插件实例，以便访问设置与国际化文案。
 * 输出：提供缓存清理与条目读取能力的存储对象。
 */
export class BibEntryStore {
  constructor(plugin) {
    this.plugin = plugin;
    this.cache = new Map();
  }

  /**
   * 功能：清空已读取的 BibTeX 文件缓存。
   * 输入：无。
   * 输出：无返回值。
   */
  clear() {
    this.cache.clear();
  }

  /**
   * 功能：读取设置中的 BibTeX 文件并合并为检索条目列表。
   * 输入：无，内部从插件设置读取路径配置。
   * 输出：按配置优先级去重后的文献条目数组。
   */
  getEntries() {
    const bibFiles = parseBibFileList(this.plugin.settings.get("bibFiles"));
    if (!bibFiles.length) return [];

    const merged = [];
    const seenKeys = new Set();

    for (const bibFile of bibFiles) {
      const resolvedPath = resolveBibFilePath(bibFile, this.plugin);

      if (!resolvedPath) {
        console.warn(this.plugin.i18n.t.absolutePathRequired);
        continue;
      }

      if (!fs.existsSync(resolvedPath)) {
        console.warn(this.plugin.i18n.t.fileNotFound + resolvedPath);
        continue;
      }

      try {
        const stat = fs.statSync(resolvedPath);
        const cacheItem = this.cache.get(resolvedPath);

        if (!cacheItem || cacheItem.mtimeMs !== stat.mtimeMs) {
          const content = fs.readFileSync(resolvedPath, "utf8");
          this.cache.set(resolvedPath, {
            mtimeMs: stat.mtimeMs,
            entries: parseBibEntries(content, resolvedPath),
          });
        }

        const { entries } = this.cache.get(resolvedPath);
        for (const entry of entries) {
          if (seenKeys.has(entry.key)) continue;
          seenKeys.add(entry.key);
          merged.push(entry);
        }
      } catch (error) {
        console.error(this.plugin.i18n.t.loadError + resolvedPath, error);
      }
    }

    return merged;
  }
}
