import { environmentLabel } from "@/shared/matching";
import type { EnvironmentMatch, ExtensionSettings } from "@/shared/types";

interface EnvironmentStatusProps {
  settings: ExtensionSettings | null;
  match: EnvironmentMatch | null;
  tabUrl?: string;
  loading: boolean;
}

export function EnvironmentStatus({
  settings,
  match,
  tabUrl,
  loading
}: EnvironmentStatusProps) {
  if (loading || !settings) {
    return (
      <section className="status">
        <div className="pill">…</div>
        <p className="name">Checking…</p>
        <p className="host" />
      </section>
    );
  }

  if (
    !tabUrl ||
    tabUrl.startsWith("chrome://") ||
    tabUrl.startsWith("chrome-extension://")
  ) {
    return (
      <section className="status">
        <div className="pill">N/A</div>
        <p className="name">No page match</p>
        <p className="host">Open a website tab to detect the environment.</p>
      </section>
    );
  }

  if (!settings.enabled) {
    return (
      <section className="status">
        <div className="pill" style={{ background: "#6b7280" }}>
          OFF
        </div>
        <p className="name">Extension disabled</p>
        <p className="host" />
      </section>
    );
  }

  if (!match) {
    let host = tabUrl;
    try {
      host = new URL(tabUrl).hostname;
    } catch {
      // keep raw url
    }
    return (
      <section className="status">
        <div className="pill">NONE</div>
        <p className="name">No matching rule</p>
        <p className="host">{host}</p>
      </section>
    );
  }

  const label = environmentLabel(match.rule.environment);

  return (
    <section className="status">
      <div className="pill" style={{ background: match.rule.color }}>
        {label}
      </div>
      <p className="name">{match.rule.name}</p>
      <p className="host">{match.hostname}</p>
    </section>
  );
}
