const { Plugin } = window[Symbol.for("typora-plugin-core@v2")];

import { DEFAULT_SETTINGS, DISPLAY_LANGUAGE, PATH_BASE_MODE } from "./constants.js";
import { createI18n } from "./i18n.js";
import { BibEntryStore } from "./bibtex/store.js";
import { parseBibFileList, serializeBibFileList } from "./bibtex/settings.js";
import { BibCitationSettingTab } from "./settings/tab.js";
import { BibCitationSidebarPanel } from "./sidebar/panel.js";
import { BibCitationSuggest } from "./suggest/suggest.js";
import { registerSuggestInteractions } from "./suggest/interactions.js";

/**
 * 功能：作为插件主控类，组合设置页、BibTeX 存储与候选建议模块。
 * 输入：由 Typora Community Plugin Framework 在加载时实例化。
 * 输出：完成插件初始化与生命周期注册的插件对象。
 */
export default class BibCitationPlugin extends Plugin {
  constructor() {
    super(...arguments);
    this.i18n = createI18n();
    this.bibStore = new BibEntryStore(this);
  }

  /**
   * 功能：根据当前设置重建国际化实例，供设置页与侧边栏即时切换语言。
   * 输入：无。
   * 输出：无返回值。
   */
  refreshI18n() {
    this.i18n = createI18n(
      this.settings?.get("displayLanguage") || DISPLAY_LANGUAGE.ZH_CN,
    );
  }

  /**
   * 功能：清空 BibTeX 缓存，供设置变更后重新加载文件。
   * 输入：无。
   * 输出：无返回值。
   */
  resetCache() {
    this.bibStore.clear();
  }

  /**
   * 功能：执行与侧边栏“刷新缓存”按钮一致的刷新流程。
   * 输入：无。
   * 输出：无返回值。
   */
  refreshCacheView() {
    this.resetCache();
    this.sidebarPanel?.render?.();
  }

  /**
   * 功能：获取当前可用于检索与展示的 BibTeX 条目列表。
   * 输入：无。
   * 输出：去重后的文献条目数组。
   */
  getBibEntries() {
    return this.bibStore.getEntries();
  }

  /**
   * 功能：注册设置、建议器与交互事件，完成插件启动。
   * 输入：无，由宿主在加载阶段调用。
   * 输出：Promise<void>。
   */
  async onload() {
    this.registerSettings(
      new window[Symbol.for("typora-plugin-core@v2")].PluginSettings(
        this.app,
        this.manifest,
        { version: 1 },
      ),
    );
    this.settings.setDefault(DEFAULT_SETTINGS);
    this.settings.set(
      "bibFiles",
      serializeBibFileList(parseBibFileList(this.settings.get("bibFiles"))),
    );
    this.settings.set(
      "pathBase",
      this.settings.get("pathBase") || PATH_BASE_MODE.MARKDOWN,
    );
    this.settings.set(
      "displayLanguage",
      this.settings.get("displayLanguage") || DISPLAY_LANGUAGE.ZH_CN,
    );
    this.refreshI18n();

    this.registerSettingTab(new BibCitationSettingTab(this));
    this.sidebarPanel = new BibCitationSidebarPanel(this);
    this.register(this.app.workspace.sidebar.addPanel(this.sidebarPanel));

    this._suggest = null;
    registerSuggestInteractions(this);

    const suggest = new BibCitationSuggest(this.app, this);
    this._suggest = suggest;
    this.registerMarkdownSugguest(suggest);
  }
}
