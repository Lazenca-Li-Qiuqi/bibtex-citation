import { escapeHtml } from "../utils/html.js";

/**
 * 功能：把单个 BibTeX 条目渲染成 Typora 建议列表使用的 HTML 字符串。
 * 输入：包含标题、作者、年份与 key 的文献条目对象。
 * 输出：候选项 HTML 字符串。
 */
export function renderBibSuggestion(item) {
  const title = escapeHtml(item.title || `@${item.key}`);
  const year = escapeHtml(item.year || "");
  const authors = escapeHtml(item.authors || "");
  const key = escapeHtml(item.key || "");

  return `
    <div class="bibtex-cite-item" data-bibtex-key="${key}">
      <div class="bibtex-cite-title">${title}</div>
      ${
        year || authors
          ? `
        <div class="bibtex-cite-meta">
          ${year ? `<span class="bibtex-cite-year">${year}</span>` : ""}
          ${authors ? `<span class="bibtex-cite-authors">${authors}</span>` : ""}
        </div>
      `
          : ""
      }
    </div>
  `.trim();
}
