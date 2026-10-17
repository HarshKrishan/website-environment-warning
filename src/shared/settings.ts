import { cloneDefaults } from "./defaults";
import type { ExtensionSettings } from "./types";

const SETTINGS_KEY = "settings";

export async function loadSettings(): Promise<ExtensionSettings> {
  const stored = await chrome.storage.sync.get(SETTINGS_KEY);
  const defaults = cloneDefaults();

  if (!stored[SETTINGS_KEY]) {
    return defaults;
  }

  const saved = stored[SETTINGS_KEY] as Partial<ExtensionSettings>;
  return {
    ...defaults,
    ...saved,
    rules: saved.rules?.length ? saved.rules : defaults.rules
  };
}

export async function saveSettings(settings: ExtensionSettings): Promise<void> {
  await chrome.storage.sync.set({ [SETTINGS_KEY]: settings });
}

export function subscribeToSettings(
  callback: (settings: ExtensionSettings) => void
): () => void {
  const listener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    area: string
  ) => {
    if (area === "sync" && changes[SETTINGS_KEY]) {
      void loadSettings().then(callback);
    }
  };

  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
