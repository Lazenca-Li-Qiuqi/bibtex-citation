import { toCslItem } from "./item.js";
import { getPluginRequire } from "./runtime.js";
import {
  collectUniqueCitationKeys,
  collectValidCitationBlocksFromMarkdown,
} from "./citation-blocks.js";

const pluginRequire = getPluginRequire();
const { Cite } = pluginRequire("@citation-js/core");

const BIBLIOGRAPHY_START_MARKER = "<!-- bibtex-citation:bibliography:start -->";
const BIBLIOGRAPHY_END_MARKER = "<!-- bibtex-citation:bibliography:end -->";

/**
 * 功能：根据当前文档中的合法 citation key 生成或更新参考文献块。
 * 输入：Markdown 文本、BibTeX 条目数组、已注册的 CSL 模板名、参考文献标题。
 * 输出：返回改写后的 Markdown 与插入统计。
 */
export function insertBibliographyMarkdown(markdown, entries, templateName, headingText) {
  const source = String(markdown || "");
  const entryMap = new Map(entries.map((entry) => [entry.key, entry]));
  const citationBlocks = collectValidCitationBlocksFromMarkdown(source, (key) => entryMap.has(key));
  if (!citationBlocks.length) {
    return createBibliographyResult(source);
  }

  const keys = collectUniqueCitationKeys(citationBlocks);
  if (!keys.length) {
    return createBibliographyResult(source);
  }

  const cite = new Cite(keys.map((key) => toCslItem(entryMap.get(key))));
  const bibliographyHtml = String(
    cite.format("bibliography", {
      template: templateName,
      format: "html",
    }) || "",
  ).trim();
  if (!bibliographyHtml) {
    return createBibliographyResult(source);
  }

  const bibliographyBlock = buildBibliographyBlock(headingText, bibliographyHtml);
  const markdownWithBibliography = upsertBibliographyBlock(source, bibliographyBlock);

  return createBibliographyResult(
    markdownWithBibliography,
    markdownWithBibliography !== source,
    keys.length,
  );
}

function createBibliographyResult(markdown, changed = false, keyCount = 0) {
  return {
    markdown,
    changed,
    keyCount,
  };
}

function buildBibliographyBlock(headingText, bibliographyHtml) {
  const normalizedHeading = String(headingText || "").trim() || "References";
  return [
    BIBLIOGRAPHY_START_MARKER,
    `## ${normalizedHeading}`,
    "",
    bibliographyHtml,
    BIBLIOGRAPHY_END_MARKER,
  ].join("\n");
}

function upsertBibliographyBlock(markdown, bibliographyBlock) {
  const source = String(markdown || "");
  const existingPattern = new RegExp(
    `${escapeRegex(BIBLIOGRAPHY_START_MARKER)}[\\s\\S]*?${escapeRegex(BIBLIOGRAPHY_END_MARKER)}`,
    "m",
  );
  if (existingPattern.test(source)) {
    return source.replace(existingPattern, bibliographyBlock);
  }

  const trimmed = source.replace(/\s+$/, "");
  return `${trimmed}\n\n${bibliographyBlock}\n`;
}

function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
