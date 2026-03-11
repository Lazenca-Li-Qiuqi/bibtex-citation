import { Cite } from "@citation-js/core";

import { ensureDefaultCslAssets } from "./assets.js";
import { toCslItem } from "./item.js";
import { extractClosedBracketRanges } from "../document/brackets.js";

/**
 * 功能：把当前文档中严格匹配 `[@key; @other]` 的合法引用块渲染为 CSL 文中引用。
 * 输入：Markdown 文本、BibTeX 条目数组、目标 locale。
 * 输出：返回改写后的 Markdown 与渲染统计。
 */
export function renderCitationMarkdown(markdown, entries, localeName) {
  const source = String(markdown || "");
  const ranges = extractClosedBracketRanges(source);
  if (!ranges.length) {
    return createRenderResult(source);
  }

  const entryMap = new Map(entries.map((entry) => [entry.key, entry]));
  const citationItemMap = new Map();
  let cursor = 0;
  let changed = false;
  let renderedBlocks = 0;
  let renderedKeys = 0;
  let output = "";

  for (const range of ranges) {
    output += source.slice(cursor, range.start);

    const keys = parseStrictCitationKeys(range.text);
    if (!keys || !keys.every((key) => entryMap.has(key))) {
      output += range.text;
      cursor = range.end;
      continue;
    }

    output += renderCitationCluster(keys, citationItemMap, entryMap, localeName);
    changed = true;
    renderedBlocks += 1;
    renderedKeys += keys.length;
    cursor = range.end;
  }

  output += source.slice(cursor);
  return createRenderResult(
    changed ? output : source,
    changed,
    renderedBlocks,
    renderedKeys,
  );
}

function createRenderResult(markdown, changed = false, renderedBlocks = 0, renderedKeys = 0) {
  return {
    markdown,
    changed,
    renderedBlocks,
    renderedKeys,
  };
}

function parseStrictCitationKeys(blockText) {
  if (!blockText.startsWith("[") || !blockText.endsWith("]")) {
    return null;
  }

  const inner = blockText.slice(1, -1).trim();
  if (!inner || !/^@([^\s\],;]+)(\s*;\s*@([^\s\],;]+))*$/.test(inner)) {
    return null;
  }

  return inner
    .split(/\s*;\s*/)
    .map((segment) => segment.replace(/^@/, "").trim())
    .filter(Boolean);
}

function renderCitationCluster(keys, citationItemMap, entryMap, localeName) {
  for (const key of keys) {
    if (!citationItemMap.has(key)) {
      citationItemMap.set(key, toCslItem(entryMap.get(key)));
    }
  }

  const { template, locale } = ensureDefaultCslAssets(localeName);
  const cite = new Cite(Array.from(citationItemMap.values()));
  return cite.format("citation", {
    template,
    lang: locale,
    format: "text",
    entry: keys,
  });
}
