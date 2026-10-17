import {
  badgeTextFor,
  colorToBadgeRgb,
  contrastText,
  matchEnvironment
} from "@/shared/matching";
import { loadSettings } from "@/shared/settings";
import type { EnvironmentMatch } from "@/shared/types";

export async function updateBadgeForTab(
  tabId: number,
  url: string | undefined
): Promise<EnvironmentMatch | null> {
  const settings = await loadSettings();

  if (!settings.enabled || !settings.badgeEnabled || !url) {
    await chrome.action.setBadgeText({ tabId, text: "" });
    return null;
  }

  const match = matchEnvironment(url, settings);
  if (!match) {
    await chrome.action.setBadgeText({ tabId, text: "" });
    return null;
  }

  const { rule } = match;
  await chrome.action.setBadgeText({
    tabId,
    text: badgeTextFor(rule.environment)
  });
  await chrome.action.setBadgeBackgroundColor({
    tabId,
    color: colorToBadgeRgb(rule.color)
  });

  try {
    await chrome.action.setBadgeTextColor({
      tabId,
      color: contrastText(rule.color)
    });
  } catch {
    // older Chrome may not support setBadgeTextColor
  }

  return match;
}

export async function refreshActiveTabBadge(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id != null) {
    await updateBadgeForTab(tab.id, tab.url);
  }
}
