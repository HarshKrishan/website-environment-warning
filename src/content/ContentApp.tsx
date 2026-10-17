import { useCallback, useEffect, useState } from "react";
import { matchEnvironment } from "@/shared/matching";
import { loadSettings, subscribeToSettings } from "@/shared/settings";
import type { EnvironmentMatch, ExtensionSettings } from "@/shared/types";
import { Banner } from "./Banner";

export function ContentApp() {
  const [match, setMatch] = useState<EnvironmentMatch | null>(null);
  const [settings, setSettings] = useState<ExtensionSettings | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const evaluate = useCallback(async (nextSettings?: ExtensionSettings) => {
    const loaded = nextSettings ?? (await loadSettings());
    setSettings(loaded);
    setMatch(matchEnvironment(location.href, loaded));
  }, []);

  useEffect(() => {
    void evaluate();
    return subscribeToSettings((next) => {
      setDismissed(false);
      void evaluate(next);
    });
  }, [evaluate]);

  useEffect(() => {
    let lastHref = location.href;

    const checkHref = () => {
      if (location.href !== lastHref) {
        lastHref = location.href;
        setDismissed(false);
        void evaluate();
      }
    };

    // Dismiss only lasts while you stay on the tab. Switching away and
    // back (or focusing the window again) should re-show the banner —
    // especially important for production reminders.
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        setDismissed(false);
        void evaluate();
      }
    };

    const id = window.setInterval(checkHref, 800);
    window.addEventListener("popstate", checkHref);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onVisibility);

    return () => {
      window.clearInterval(id);
      window.removeEventListener("popstate", checkHref);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onVisibility);
    };
  }, [evaluate]);

  if (!settings?.enabled || !settings.bannerEnabled || !match || dismissed) {
    return null;
  }

  return <Banner match={match} onDismiss={() => setDismissed(true)} />;
}
