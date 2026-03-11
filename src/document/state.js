import { extractClosedBracketRanges } from "./brackets.js";

/**
 * 功能：维护当前 Markdown 文档的轻量状态缓存，避免重复统计引用信息。
 * 输入：构造后通过 `getCitationState(markdown, validCitationKeys)` 接收当前文档内容与合法 key 集合。
 * 输出：返回当前文档中的唯一引用条数、总引用次数与可能的校验错误。
 */
export class CurrentDocumentState {
  constructor() {
    this.clear();
  }

  /**
   * 功能：清空当前文档状态缓存。
   * 输入：无。
   * 输出：无返回值。
   */
  clear() {
    this.lastMarkdown = null;
    this.citationCount = { unique: 0, total: 0 };
    this.citationError = "";
  }

  /**
   * 功能：按当前 Markdown 内容统计引用信息，并校验所有闭合引用块中的 citation key。
   * 输入：当前文档 Markdown 文本与合法 citation key 集合。
   * 输出：包含唯一引用条数、总引用次数与错误信息的对象。
   */
  getCitationState(markdown, validCitationKeys) {
    if (!markdown) {
      this.lastMarkdown = markdown || "";
      this.citationCount = { unique: 0, total: 0 };
      this.citationError = "";
      return { counts: this.citationCount, error: this.citationError };
    }

    if (markdown === this.lastMarkdown) {
      return { counts: this.citationCount, error: this.citationError };
    }

    const keys = new Set();
    let total = 0;
    const citationPattern = /@([^\s\],;]+)/g;

    for (const { text: block } of extractClosedBracketRanges(markdown)) {
      let match = citationPattern.exec(block);
      let hasCitation = false;
      while (match) {
        hasCitation = true;
        const citationKey = match[1];
        if (!validCitationKeys.has(citationKey)) {
          this.lastMarkdown = markdown;
          this.citationError = citationKey;
          return { counts: this.citationCount, error: this.citationError };
        }

        keys.add(citationKey);
        total += 1;
        match = citationPattern.exec(block);
      }
      citationPattern.lastIndex = 0;

      if (!hasCitation) {
        continue;
      }
    }

    this.lastMarkdown = markdown;
    this.citationCount = { unique: keys.size, total };
    this.citationError = "";
    return { counts: this.citationCount, error: this.citationError };
  }
}
