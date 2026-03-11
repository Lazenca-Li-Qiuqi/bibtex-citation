/**
 * 功能：按 `]` 回扫最近的 `[`，提取同一行内最小粒度的闭合方括号片段及其位置。
 * 输入：完整 Markdown 文本。
 * 输出：按出现顺序返回所有候选闭合方括号范围对象数组。
 */
export function extractClosedBracketRanges(markdown) {
  const ranges = [];
  const source = String(markdown);
  const linePattern = /.*(?:\r?\n|$)/g;
  let match;

  while ((match = linePattern.exec(source)) !== null) {
    const fullLine = match[0];
    if (!fullLine) {
      break;
    }

    const lineBreakMatch = fullLine.match(/\r?\n$/);
    const lineBreakLength = lineBreakMatch ? lineBreakMatch[0].length : 0;
    const line = lineBreakLength ? fullLine.slice(0, -lineBreakLength) : fullLine;
    const lineOffset = match.index;
    let searchStart = 0;

    while (searchStart < line.length) {
      const closeIndex = line.indexOf("]", searchStart);
      if (closeIndex === -1) {
        break;
      }

      const openIndex = line.lastIndexOf("[", closeIndex);
      if (openIndex >= searchStart) {
        ranges.push({
          start: lineOffset + openIndex,
          end: lineOffset + closeIndex + 1,
          text: line.slice(openIndex, closeIndex + 1),
        });
        // 成功提取一个闭合块后，后续扫描从这个右括号之后继续，避免多余的 `]` 重复回配到已消费的 `[`.
        searchStart = closeIndex + 1;
        continue;
      }

      searchStart = closeIndex + 1;
    }
  }

  return ranges;
}
