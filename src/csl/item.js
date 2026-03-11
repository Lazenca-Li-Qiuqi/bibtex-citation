/**
 * 功能：把当前插件内部的 BibTeX 条目映射为 Citation.js 可接受的 CSL-JSON。
 * 输入：单个 BibTeX 条目对象。
 * 输出：最小可用于文中引用与后续参考文献渲染的 CSL-JSON 条目。
 */
export function toCslItem(entry) {
  return {
    id: entry.key,
    type: mapBibTypeToCslType(entry.type),
    title: entry.title || "",
    author: parseCslAuthors(entry.authors),
    editor: parseCslAuthors(entry.editors),
    issued: parseIssued(entry.year),
    "container-title": resolveContainerTitle(entry),
    DOI: entry.doi || "",
    publisher: entry.publisher || entry.institution || "",
    volume: entry.volume || undefined,
    issue: entry.issue || undefined,
    page: entry.pages || undefined,
  };
}

function mapBibTypeToCslType(type) {
  switch (String(type || "").toLowerCase()) {
    case "article":
      return "article-journal";
    case "inproceedings":
    case "conference":
      return "paper-conference";
    case "book":
      return "book";
    case "inbook":
    case "incollection":
      return "chapter";
    case "phdthesis":
    case "mastersthesis":
    case "thesis":
      return "thesis";
    case "report":
      return "report";
    case "manual":
      return "book";
    case "webpage":
    case "online":
      return "webpage";
    default:
      return "article";
  }
}

function parseIssued(rawYear) {
  const value = String(rawYear || "").trim();
  if (!value) {
    return undefined;
  }

  const yearMatch = value.match(/\d{4}/);
  if (!yearMatch) {
    return { literal: value };
  }

  return {
    "date-parts": [[Number(yearMatch[0])]],
  };
}

function parseCslAuthors(rawAuthors) {
  return String(rawAuthors || "")
    .split(/\s+and\s+/i)
    .map((author) => author.trim())
    .filter(Boolean)
    .map((author) => parseSingleAuthor(author))
    .filter(Boolean);
}

function resolveContainerTitle(entry) {
  if (!entry) {
    return "";
  }

  const type = String(entry.type || "").toLowerCase();
  if (type === "inproceedings" || type === "conference" || type === "incollection" || type === "inbook") {
    return entry.booktitle || entry.journal || "";
  }

  return entry.journal || entry.booktitle || "";
}

function parseSingleAuthor(author) {
  const normalized = author.replace(/[{}]/g, "").trim();
  if (!normalized) {
    return null;
  }

  if (author.startsWith("{") && author.endsWith("}")) {
    return { literal: normalized };
  }

  if (normalized.includes(",")) {
    const [family, ...rest] = normalized.split(",");
    const given = rest.join(",").trim();
    return given
      ? { family: family.trim(), given }
      : { family: family.trim() };
  }

  const tokens = normalized.split(/\s+/).filter(Boolean);
  if (tokens.length === 1) {
    return { literal: normalized };
  }

  return {
    family: tokens[tokens.length - 1],
    given: tokens.slice(0, -1).join(" "),
  };
}
