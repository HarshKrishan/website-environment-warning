import { useCallback, useEffect, useState } from "react";
import { loadSettings, saveSettings, subscribeToSettings } from "../settings";
import type { ExtensionSettings } from "../types";
import { refreshBadge } from "../messaging";

export function useSettings() {
  const [settings, setSettings] = useState<ExtensionSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void loadSettings().then((loaded) => {
      if (!cancelled) {
        setSettings(loaded);
        setLoading(false);
      }
    });

    const unsubscribe = subscribeToSettings((next) => {
      if (!cancelled) setSettings(next);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const persist = useCallback(async (next: ExtensionSettings) => {
    setSaving(true);
    try {
      await saveSettings(next);
      setSettings(next);
      await refreshBadge();
    } finally {
      setSaving(false);
    }
  }, []);

  return { settings, setSettings, loading, saving, persist };
}
