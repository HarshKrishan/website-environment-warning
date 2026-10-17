import { cloneDefaults } from "@/shared/defaults";
import { matchEnvironment } from "@/shared/matching";
import { loadSettings } from "@/shared/settings";
import type { RuntimeMessage } from "@/shared/types";
import { refreshActiveTabBadge, updateBadgeForTab } from "./badge";
import {
  handleBeforeNavigate,
  markPendingNavigation,
  setCooldown
} from "./productionWarning";

chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.sync.get("settings");
  if (!stored.settings) {
    await chrome.storage.sync.set({ settings: cloneDefaults() });
  }
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    await updateBadgeForTab(tabId, tab.url);
  } catch {
    // tab may be closed
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url || changeInfo.status === "complete") {
    await updateBadgeForTab(tabId, tab.url);
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.settings) {
    void refreshActiveTabBadge();
  }
});

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  void handleBeforeNavigate(details);
});

chrome.runtime.onMessage.addListener(
  (message: RuntimeMessage, _sender, sendResponse) => {
    void (async () => {
      if (message.type === "GET_MATCH") {
        const settings = await loadSettings();
        const match = matchEnvironment(message.url, settings);
        sendResponse({ settings, match });
        return;
      }

      if (message.type === "CONTINUE_TO_PRODUCTION") {
        const settings = await loadSettings();
        if (message.remember) {
          await setCooldown(
            message.hostname,
            settings.warningCooldownMinutes || 30
          );
        }
        await markPendingNavigation(message.tabId, message.targetUrl);
        await chrome.tabs.update(message.tabId, { url: message.targetUrl });
        sendResponse({ ok: true });
        return;
      }

      if (message.type === "REFRESH_BADGE") {
        await refreshActiveTabBadge();
        sendResponse({ ok: true });
      }
    })();

    return true;
  }
);
