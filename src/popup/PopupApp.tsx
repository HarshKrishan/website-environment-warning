import { useEffect, useState } from "react";
import { useSettings } from "@/shared/hooks/useSettings";
import { matchEnvironment } from "@/shared/matching";
import type { EnvironmentMatch } from "@/shared/types";
import { EnvironmentStatus } from "./components/EnvironmentStatus";

export function PopupApp() {
  const { settings, loading, persist } = useSettings();
  const [tabUrl, setTabUrl] = useState<string>();
  const [match, setMatch] = useState<EnvironmentMatch | null>(null);

  useEffect(() => {
    void chrome.tabs
      .query({ active: true, currentWindow: true })
      .then(([tab]) => setTabUrl(tab?.url));
  }, []);

  useEffect(() => {
    if (!settings || !tabUrl) {
      setMatch(null);
      return;
    }
    setMatch(matchEnvironment(tabUrl, settings));
  }, [settings, tabUrl]);

  const note =
    !settings?.enabled
      ? "Turn it on to show banners and badges."
      : !match && tabUrl && !tabUrl.startsWith("chrome")
        ? "Add a hostname pattern in settings."
        : match?.rule.environment === "production"
          ? "Production navigations can show a confirm screen."
          : "";

  return (
    <div className="popup">
      <header className="popup-header">
        <h1>Environment</h1>
        <label className="switch" title="Enable extension">
          <input
            type="checkbox"
            checked={settings?.enabled ?? false}
            disabled={!settings}
            onChange={(e) => {
              if (!settings) return;
              void persist({ ...settings, enabled: e.target.checked });
            }}
          />
          <span>On</span>
        </label>
      </header>

      <EnvironmentStatus
        settings={settings}
        match={match}
        tabUrl={tabUrl}
        loading={loading}
      />

      <p className="note">{note}</p>

      <footer className="popup-footer">
        <button type="button" onClick={() => chrome.runtime.openOptionsPage()}>
          Configure rules
        </button>
      </footer>
    </div>
  );
}
