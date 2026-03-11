import { PATH_BASE_MODE } from "../constants.js";

const path = window.reqnode("path");

/**
 * 功能：尽量从当前 Typora 界面状态推断正在编辑的 Markdown 文件路径。
 * 输入：无。
 * 输出：当前 Markdown 绝对路径；若无法确定则返回 null。
 */
export function getActiveMarkdownPath() {
  const activeNode = document.querySelector(
    ".file-library-node.file-library-file-node.active",
  );
  if (activeNode) {
    const activePath = activeNode.getAttribute("data-path");
    if (activePath && activePath.endsWith(".md")) {
      return activePath;
    }
  }

  const titleMatch = document.title.match(/(.+\.md)/);
  if (titleMatch) {
    return titleMatch[1];
  }

  return null;
}

/**
 * 功能：获取相对路径解析时使用的 Typora 基准目录。
 * 输入：插件实例。
 * 输出：Typora 当前打开目录或进程工作目录。
 */
export function getTyporaBasePath(plugin) {
  const vaultPath = plugin?.app?.vault?.path;
  if (vaultPath) {
    return vaultPath;
  }

  return process.cwd();
}

/**
 * 功能：判断当前路径模式下是否应拒绝相对 BibTeX 路径。
 * 输入：插件实例、用户填写的路径。
 * 输出：布尔值，true 表示当前模式只允许绝对路径。
 */
export function shouldRejectRelativePath(plugin, filePath) {
  return (
    plugin.settings.get("pathBase") === PATH_BASE_MODE.ABSOLUTE &&
    !path.isAbsolute(String(filePath || "").trim())
  );
}

/**
 * 功能：按照当前设置把 BibTeX 路径解析为可读取的绝对路径。
 * 输入：原始路径字符串、插件实例。
 * 输出：解析后的绝对路径；若在当前模式下不允许则返回空字符串。
 */
export function resolveBibFilePath(rawPath, plugin) {
  const trimmedPath = String(rawPath || "").trim();
  if (!trimmedPath) return "";
  if (path.isAbsolute(trimmedPath)) return trimmedPath;

  const pathBase = plugin.settings.get("pathBase");

  if (pathBase === PATH_BASE_MODE.ABSOLUTE) {
    return "";
  }

  if (pathBase === PATH_BASE_MODE.MARKDOWN) {
    const activeMarkdownPath = getActiveMarkdownPath();
    if (activeMarkdownPath) {
      return path.resolve(path.dirname(activeMarkdownPath), trimmedPath);
    }
  }

  return path.resolve(getTyporaBasePath(plugin), trimmedPath);
}
