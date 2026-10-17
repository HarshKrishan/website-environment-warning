import { matchEnvironment } from "@/shared/matching";
import { loadSettings } from "@/shared/settings";

const COOLDOWN_KEY = "productionWarningCooldowns";
const PENDING_KEY = "pendingProductionNavigations";

type CooldownMap = Record<string, number>;
type PendingMap = Record<number, string>;

async function getCooldowns(): Promise<CooldownMap> {
  const data = await chrome.storage.session.get(COOLDOWN_KEY);
  return (data[COOLDOWN_KEY] as CooldownMap) || {};
}

export async function setCooldown(
  hostname: string,
  minutes: number
): Promise<void> {
  const cooldowns = await getCooldowns();
  cooldowns[hostname] = Date.now() + minutes * 60 * 1000;
  await chrome.storage.session.set({ [COOLDOWN_KEY]: cooldowns });
}

async function isOnCooldown(hostname: string): Promise<boolean> {
  const cooldowns = await getCooldowns();
  const expiry = cooldowns[hostname];
  if (!expiry) return false;
  if (Date.now() > expiry) {
    delete cooldowns[hostname];
    await chrome.storage.session.set({ [COOLDOWN_KEY]: cooldowns });
    return false;
  }
  return true;
}

async function getPending(): Promise<PendingMap> {
  const data = await chrome.storage.session.get(PENDING_KEY);
  return (data[PENDING_KEY] as PendingMap) || {};
}

async function setPending(map: PendingMap): Promise<void> {
  await chrome.storage.session.set({ [PENDING_KEY]: map });
}

export async function markPendingNavigation(
  tabId: number,
  url: string
): Promise<void> {
  const map = await getPending();
  map[tabId] = url;
  await setPending(map);
}

export async function handleBeforeNavigate(
  details: chrome.webNavigation.WebNavigationParentedCallbackDetails
): Promise<void> {
  if (details.frameId !== 0) return;
  if (!details.url || details.url.startsWith("chrome-extension://")) return;

  const settings = await loadSettings();
  if (!settings.enabled || !settings.productionWarningEnabled) return;

  const match = matchEnvironment(details.url, settings);
  if (!match || match.rule.environment !== "production") return;
  if (await isOnCooldown(match.hostname)) return;

  const pending = await getPending();
  if (pending[details.tabId] === details.url) {
    delete pending[details.tabId];
    await setPending(pending);
    return;
  }

  const warningUrl = new URL(chrome.runtime.getURL("src/warning/index.html"));
  warningUrl.searchParams.set("target", details.url);
  warningUrl.searchParams.set("host", match.hostname);
  warningUrl.searchParams.set("name", match.rule.name || "Production");
  warningUrl.searchParams.set("color", match.rule.color || "#ef4444");

  pending[details.tabId] = details.url;
  await setPending(pending);

  try {
    await chrome.tabs.update(details.tabId, { url: warningUrl.toString() });
  } catch {
    // navigation may already be committed
  }
}
