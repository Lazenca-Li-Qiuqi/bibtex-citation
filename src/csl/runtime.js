const { createRequire } = window.reqnode("module");

/**
 * 功能：创建一个以当前插件模块文件为基准的 Node require。
 * 说明：Typora 渲染器默认的 `window.reqnode()` 解析基准不在插件目录，
 * 因此读取插件本地 `node_modules` 时需要显式改用 `createRequire(import.meta.url)`。
 * 输入：无。
 * 输出：可解析当前插件依赖的 require 函数。
 */
export function getPluginRequire() {
  return createRequire(import.meta.url);
}
