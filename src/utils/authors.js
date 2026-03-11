import { normalizeWhitespace } from "./html.js";

/**
 * 功能：从单个 BibTeX 作者片段中提取用于 author-date 展示的姓氏或机构名。
 * 输入：单个作者字符串，兼容 `Last, First`、`First Last` 与 `{Institution}` 形式。
 * 输出：适合候选项展示的作者标签。
 */
function extractDisplayAuthorName(author) {
  const normalized = normalizeWhitespace(author).replace(/[{}]/g, "").trim();
  if (!normalized) return "";

  if (normalized.includes(",")) {
    return normalized.split(",")[0].trim();
  }

  const tokens = normalized.split(" ").filter(Boolean);
  if (!tokens.length) return "";
  return tokens[tokens.length - 1];
}

/**
 * 功能：把 BibTeX 原始作者串格式化为常见 author-date 风格。
 * 输入：BibTeX `author` 字段原始字符串。
 * 输出：一位作者显示一位，两位作者显示两位，三位及以上显示首位作者加 `et al.`。
 */
export function formatAuthorDateAuthors(rawAuthors) {
  const authors = String(rawAuthors || "")
    .split(/\s+and\s+/i)
    .map((author) => extractDisplayAuthorName(author))
    .filter(Boolean);

  if (!authors.length) return "";
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
  return `${authors[0]} et al.`;
}
