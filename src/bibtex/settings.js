/**
 * 功能：把设置层保存的 BibTeX 路径字符串拆成路径数组。
 * 输入：设置中的原始字符串，支持逗号、分号与换行混合分隔。
 * 输出：去掉空项后的路径数组。
 */
export function parseBibFileList(value) {
  return String(value || "")
    .split(/[\r\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * 功能：把路径数组重新序列化为设置层使用的换行分隔字符串。
 * 输入：BibTeX 路径数组。
 * 输出：写回设置时使用的字符串。
 */
export function serializeBibFileList(items) {
  return items
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .join("\n");
}
