import { plugins } from "@citation-js/core";
import "@citation-js/plugin-csl";
import { createRequire } from "node:module";

const reqnode =
  globalThis.window?.reqnode?.bind(globalThis.window) ||
  createRequire(import.meta.url) ||
  null;

if (!reqnode) {
  throw new Error("Node runtime is required for CSL asset loading.");
}

const fs = reqnode("fs");
const path = reqnode("path");
const { fileURLToPath } = reqnode("url");

const DEFAULT_TEMPLATE_NAME = "bibtex-citation-default-ams";
const DEFAULT_STYLE_FILE = "american-meteorological-society.csl";
const LOCALE_FILES = {
  "en-US": "locales-en-US.xml",
  "zh-CN": "locales-zh-CN.xml",
};

let defaultTemplateRegistered = false;
const registeredLocales = new Set();

/**
 * 功能：确保默认 CSL 模板与所需 locale 已注册到 Citation.js。
 * 输入：locale 语言标签。
 * 输出：返回可直接用于 Citation.js 的模板名与 locale 名。
 */
export function ensureDefaultCslAssets(localeName) {
  const normalizedLocale = LOCALE_FILES[localeName] ? localeName : "en-US";
  const config = plugins.config.get("@csl");

  if (!defaultTemplateRegistered) {
    config.templates.add(
      DEFAULT_TEMPLATE_NAME,
      readFixtureFile(path.join("styles", DEFAULT_STYLE_FILE)),
    );
    defaultTemplateRegistered = true;
  }

  if (!registeredLocales.has(normalizedLocale)) {
    config.locales.add(
      normalizedLocale,
      readFixtureFile(path.join("locales", LOCALE_FILES[normalizedLocale])),
    );
    registeredLocales.add(normalizedLocale);
  }

  return {
    template: DEFAULT_TEMPLATE_NAME,
    locale: normalizedLocale,
  };
}

function readFixtureFile(relativePath) {
  return fs.readFileSync(resolveFixturePath(relativePath), "utf8");
}

function resolveFixturePath(relativePath) {
  const currentFilePath = fileURLToPath(import.meta.url);
  const pluginRoot = path.resolve(path.dirname(currentFilePath), "..", "..");
  return path.join(pluginRoot, "fixtures", "csl", relativePath);
}
