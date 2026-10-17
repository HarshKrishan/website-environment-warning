import type { CSSProperties } from "react";
import { environmentLabel } from "@/shared/matching";
import type { EnvironmentMatch } from "@/shared/types";

interface BannerProps {
  match: EnvironmentMatch;
  onDismiss: () => void;
}

export function Banner({ match, onDismiss }: BannerProps) {
  const { rule, hostname } = match;
  const label = environmentLabel(rule.environment);
  const textColor = rule.textColor || "#111111";

  const style = {
    "--wew-bg": rule.color,
    "--wew-fg": textColor
  } as CSSProperties;

  return (
    <div
      className="wew-banner"
      role="status"
      aria-live="polite"
      data-environment={rule.environment}
      style={style}
    >
      <div className="wew-banner-inner">
        <span className="wew-banner-pill">{label}</span>
        <span className="wew-banner-msg">
          You are on <strong>{rule.name}</strong>{" "}
          <span className="wew-banner-host">({hostname})</span>
        </span>
        <button
          type="button"
          className="wew-banner-dismiss"
          title="Dismiss for this page"
          aria-label="Dismiss banner"
          onClick={onDismiss}
        >
          ×
        </button>
      </div>
    </div>
  );
}
