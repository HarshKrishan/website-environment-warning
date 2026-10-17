import type { EnvironmentMatch, EnvironmentType, ExtensionSettings } from "./types";

/** Convert a hostname pattern with `*` wildcards into a RegExp. */
export function patternToRegExp(pattern: string): RegExp {
  const escaped = pattern
    .trim()
    .toLowerCase()
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`, "i");
}

/** First enabled matching rule for a URL, or null. */
export function matchEnvironment(
  urlString: string,
  settings: ExtensionSettings
): EnvironmentMatch | null {
  let hostname = "";
  try {
    hostname = new URL(urlString).hostname.toLowerCase();
  } catch {
    return null;
  }

  for (const rule of settings.rules) {
    if (!rule.enabled) continue;
    for (const pattern of rule.patterns) {
      if (!pattern?.trim()) continue;
      try {
        if (patternToRegExp(pattern).test(hostname)) {
          return { rule, hostname };
        }
      } catch {
        // skip invalid pattern
      }
    }
  }

  return null;
}

export function environmentLabel(environment: EnvironmentType | string): string {
  switch (environment) {
    case "localhost":
      return "LOCAL";
    case "staging":
      return "STAGING";
    case "production":
      return "PRODUCTION";
    default:
      return String(environment || "UNKNOWN").toUpperCase();
  }
}

export function badgeTextFor(environment: EnvironmentType | string): string {
  switch (environment) {
    case "localhost":
      return "LOC";
    case "staging":
      return "STG";
    case "production":
      return "PROD";
    default:
      return "?";
  }
}

export function contrastText(hex: string): string {
  const c = hex.replace("#", "");
  if (c.length !== 6) return "#111111";
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#111111" : "#ffffff";
}

export function colorToBadgeRgb(hex: string): [number, number, number, number] {
  const c = hex.replace("#", "");
  if (c.length !== 6) return [128, 128, 128, 255];
  return [
    parseInt(c.slice(0, 2), 16),
    parseInt(c.slice(2, 4), 16),
    parseInt(c.slice(4, 6), 16),
    255
  ];
}
