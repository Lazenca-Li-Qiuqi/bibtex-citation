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

    for (const block of extractClosedBracketBlocks(markdown)) {
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

/**
 * 功能：按 `]` 回扫最近的 `[`，提取同一行内最小粒度的闭合方括号片段。
 * 输入：完整 Markdown 文本。
 * 输出：按出现顺序返回所有候选闭合方括号字符串数组。
 */
function extractClosedBracketBlocks(markdown) {
  const blocks = [];

  for (const line of String(markdown).split(/\r?\n/)) {
    let searchStart = 0;

    while (searchStart < line.length) {
      const closeIndex = line.indexOf("]", searchStart);
      if (closeIndex === -1) {
        break;
      }

      const openIndex = line.lastIndexOf("[", closeIndex);
      if (openIndex >= searchStart) {
        blocks.push(line.slice(openIndex, closeIndex + 1));
        // 成功提取一个闭合块后，后续扫描从这个右括号之后继续，避免多余的 `]` 重复回配到已消费的 `[`.
        searchStart = closeIndex + 1;
        continue;
      }

      searchStart = closeIndex + 1;
    }
  }

  return blocks;
}
