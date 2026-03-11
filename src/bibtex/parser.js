import { normalizeWhitespace } from "../utils/html.js";

/**
 * 功能：解析单个 BibTeX 字段值，去掉外围引号或花括号并规范空白。
 * 输入：BibTeX 原始字段值。
 * 输出：适合展示与检索的纯文本字段值。
 */
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
/**
 * 功能：从 BibTeX 文件文本中提取文献条目并构造检索用字段。
 * 输入：BibTeX 文件内容、来源文件路径。
 * 输出：可用于建议列表与搜索的条目数组。
 */
export function parseBibEntries(content, sourcePath) {
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
      doi: fields.doi || "",
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
          fields.doi,
          fields.publisher,
        ].join(" "),
      ).toLowerCase(),
    });
  }

  return entries;
}
