function clampSuggestContainerToViewport(container) {
  if (!container) return;

  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
  if (!viewportWidth) return;

  const margin = 12;
  const maxWidth = Math.max(320, Math.min(672, viewportWidth - margin * 2));
  container.style.maxWidth = `${maxWidth}px`;
  container.style.width = `${maxWidth}px`;
  container.style.transform = "";

  const rect = container.getBoundingClientRect();
  let deltaX = 0;

  if (rect.right > viewportWidth - margin) {
    deltaX -= rect.right - (viewportWidth - margin);
  }
  if (rect.left + deltaX < margin) {
    deltaX += margin - (rect.left + deltaX);
  }

  if (Math.abs(deltaX) > 0.5) {
    container.style.transform = `translateX(${Math.round(deltaX)}px)`;
  }
}

function clampAllSuggestContainers() {
  document.querySelectorAll(".auto-suggest-container").forEach((container) => {
    clampSuggestContainerToViewport(container);
  });
}

function getSuggestionContainerForKeyboardApply() {
  return Array.from(document.querySelectorAll(".auto-suggest-container")).find((container) => {
    if (!(container instanceof HTMLElement)) return false;
    if (!container.querySelector(".bibtex-cite-item[data-bibtex-key]")) return false;
    return container.getBoundingClientRect().height > 0;
  });
}

function getSelectedBibtexSuggestionKey(container) {
  const selectedItem = container?.querySelector(
    ".typ-suggestion.active, .typ-suggestion.mod-active, .typ-suggestion[aria-selected='true'], .suggestion-item.is-selected, .suggestion-item.active, .suggestion-item.mod-active, .suggestion-item[aria-selected='true']",
  );
  const bibtexItem = selectedItem?.matches?.(".bibtex-cite-item[data-bibtex-key]")
    ? selectedItem
    : selectedItem?.querySelector?.(".bibtex-cite-item[data-bibtex-key]");
  return bibtexItem?.getAttribute?.("data-bibtex-key") || "";
}

function getFirstBibtexSuggestionKey(suggest, container) {
  const query = suggest?._query || "";
  if (suggest?.getSuggestions && query) {
    const firstSuggestion = suggest.getSuggestions(query)[0];
    if (firstSuggestion?.key) {
      return firstSuggestion.key;
    }
  }

  const firstBibtexItem = container?.querySelector?.(".bibtex-cite-item[data-bibtex-key]");
  return firstBibtexItem?.getAttribute?.("data-bibtex-key") || "";
}

function getBibtexSuggestionItemFromEventTarget(target) {
  const itemEl = target?.closest?.(".bibtex-cite-item[data-bibtex-key]");
  if (!itemEl || !itemEl.closest(".auto-suggest-container")) {
    return null;
  }
  return itemEl;
}

function shouldSuppressFollowupPointerEvent(until) {
  return Number.isFinite(until) && Date.now() <= until;
}

function shouldScheduleCitationRefreshFromKeydown(event) {
  if (event.isComposing) {
    return false;
  }

  return event.key === "]" || event.key === "Backspace" || event.key === "Delete";
}

function applySuggestionFromCurrentState(suggest, replacementText) {
  const editor = window.editor;
  const anchor = editor?.autoComplete?.state?.anchor;
  if (!anchor?.containerNode?.firstChild) {
    return false;
  }

  const activeRange = editor.selection.getRangy();
  const anchorTextNode = anchor.containerNode.firstChild;
  const query = suggest._query || "";
  const replaceLength = suggest.lengthOfTextBeforeToBeReplaced(query);

  activeRange.setStart(anchorTextNode, Math.max(0, anchor.start - replaceLength));
  activeRange.setEnd(anchorTextNode, anchor.end);
  editor.selection.setRange(activeRange, true);
  editor.UserOp.pasteHandler(editor, replacementText, true);
  editor.autoComplete.hide();
  return true;
}

/**
 * 功能：注册候选列表的定位修正、回车兜底插入与鼠标点击兜底行为。
 * 输入：插件实例，内部会挂接必要的事件处理器与清理逻辑。
 * 输出：无返回值。
 */
export function registerSuggestInteractions(plugin) {
  plugin._scheduleSuggestClamp = () => {
    window.requestAnimationFrame(() => {
      clampAllSuggestContainers();
    });
  };

  plugin._suggestContainerObserver = new MutationObserver(() => {
    plugin._scheduleSuggestClamp();
  });
  plugin._suggestContainerObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
  plugin.register(() => {
    plugin._suggestContainerObserver?.disconnect();
  });

  plugin.registerDomEvent(window, "resize", () => {
    plugin._scheduleSuggestClamp();
  });

  plugin._handleCitationStateKeydown = (event) => {
    if (!shouldScheduleCitationRefreshFromKeydown(event)) {
      return;
    }

    plugin.scheduleCitationStateRefresh();
  };
  document.addEventListener("keydown", plugin._handleCitationStateKeydown, true);
  plugin.register(() => {
    document.removeEventListener("keydown", plugin._handleCitationStateKeydown, true);
  });

  plugin._handleSuggestEnterKey = (event) => {
    if (event.key !== "Enter" || event.isComposing) {
      return;
    }

    const suggestContainer = getSuggestionContainerForKeyboardApply();
    if (!suggestContainer) {
      return;
    }

    const citationKey =
      getSelectedBibtexSuggestionKey(suggestContainer) ||
      getFirstBibtexSuggestionKey(plugin._suggest, suggestContainer);
    if (!citationKey) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    applySuggestionFromCurrentState(plugin._suggest, `@${citationKey}`);
  };
  document.addEventListener("keydown", plugin._handleSuggestEnterKey, true);
  plugin.register(() => {
    document.removeEventListener("keydown", plugin._handleSuggestEnterKey, true);
  });

  plugin._suppressPointerEventsUntil = 0;
  plugin._handleSuggestPointerDown = (event) => {
    const itemEl = getBibtexSuggestionItemFromEventTarget(event.target);
    if (!itemEl) {
      return;
    }

    const citationKey = itemEl.getAttribute("data-bibtex-key");
    if (!citationKey) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    plugin._suppressPointerEventsUntil = Date.now() + 250;
    applySuggestionFromCurrentState(plugin._suggest, `@${citationKey}`);
  };

  plugin._handleSuggestPointerFinish = (event) => {
    if (!shouldSuppressFollowupPointerEvent(plugin._suppressPointerEventsUntil)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    if (event.type === "click") {
      plugin._suppressPointerEventsUntil = 0;
    }
  };

  document.addEventListener("mousedown", plugin._handleSuggestPointerDown, true);
  document.addEventListener("mouseup", plugin._handleSuggestPointerFinish, true);
  document.addEventListener("click", plugin._handleSuggestPointerFinish, true);
  plugin.register(() => {
    document.removeEventListener("mousedown", plugin._handleSuggestPointerDown, true);
    document.removeEventListener("mouseup", plugin._handleSuggestPointerFinish, true);
    document.removeEventListener("click", plugin._handleSuggestPointerFinish, true);
  });
}
