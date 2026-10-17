import type { EnvironmentMatch, ExtensionSettings, RuntimeMessage } from "./types";

export async function sendMessage<T>(message: RuntimeMessage): Promise<T> {
  return chrome.runtime.sendMessage(message) as Promise<T>;
}

export async function getMatchForUrl(url: string): Promise<{
  settings: ExtensionSettings;
  match: EnvironmentMatch | null;
}> {
  return sendMessage({ type: "GET_MATCH", url });
}

export async function refreshBadge(): Promise<void> {
  await sendMessage({ type: "REFRESH_BADGE" }).catch(() => undefined);
}

export async function continueToProduction(params: {
  tabId: number;
  targetUrl: string;
  hostname: string;
  remember: boolean;
}): Promise<void> {
  await sendMessage({ type: "CONTINUE_TO_PRODUCTION", ...params });
}
