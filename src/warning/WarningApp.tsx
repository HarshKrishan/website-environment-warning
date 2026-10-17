import { useMemo, useState } from "react";
import { continueToProduction } from "@/shared/messaging";

function readParams() {
  const params = new URLSearchParams(location.search);
  return {
    target: params.get("target") || "",
    hostname: params.get("host") || "",
    name: params.get("name") || "Production",
    color: params.get("color") || "#ef4444"
  };
}

export function WarningApp() {
  const { target, hostname, name, color } = useMemo(() => readParams(), []);
  const [remember, setRemember] = useState(false);
  const [busy, setBusy] = useState(false);

  const goBack = () => {
    if (history.length > 1) {
      history.back();
    } else {
      window.close();
    }
  };

  const continueNav = async () => {
    if (!target) return;
    setBusy(true);
    try {
      const tab = await chrome.tabs.getCurrent();
      if (tab?.id == null) throw new Error("Missing tab id");
      await continueToProduction({
        tabId: tab.id,
        targetUrl: target,
        hostname,
        remember
      });
    } catch (err) {
      console.error(err);
      setBusy(false);
    }
  };

  return (
    <main className="card">
      <div className="badge" style={{ background: color }}>
        PRODUCTION
      </div>
      <h1>You are about to open production</h1>
      <p className="lead">
        This URL matches a <strong>{name}</strong> rule. Continue only if you
        intend to work on the live environment.
      </p>
      <p className="url">{target || "(missing URL)"}</p>
      <label className="remember">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
        />
        Don’t warn again for this host for a while
      </label>
      <div className="actions">
        <button type="button" className="secondary" onClick={goBack}>
          Go back
        </button>
        <button
          type="button"
          className="danger"
          disabled={!target || busy}
          onClick={() => void continueNav()}
        >
          {busy ? "Opening…" : "Continue to production"}
        </button>
      </div>
    </main>
  );
}
