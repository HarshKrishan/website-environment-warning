import { cloneDefaults, ENV_TYPES } from "./defaults";
import { contrastText } from "./matching";
import type {
  EnvironmentRule,
  EnvironmentType,
  ExtensionSettings
} from "./types";

export const SETTINGS_EXPORT_FORMAT = "website-environment-warning";
export const SETTINGS_EXPORT_VERSION = 1;

export interface SettingsExportFile {
  format: typeof SETTINGS_EXPORT_FORMAT;
  version: number;
  exportedAt: string;
  settings: ExtensionSettings;
}

function isEnvironmentType(value: unknown): value is EnvironmentType {
  return (
    typeof value === "string" &&
    (ENV_TYPES as readonly string[]).includes(value)
  );
}

function normalizeRule(raw: unknown, index: number): EnvironmentRule {
  if (!raw || typeof raw !== "object") {
    throw new Error(`Rule #${index + 1} is invalid`);
  }

  const rule = raw as Partial<EnvironmentRule>;
  if (!isEnvironmentType(rule.environment)) {
    throw new Error(
      `Rule #${index + 1} has an invalid environment (use localhost, staging, or production)`
    );
  }

  const color =
    typeof rule.color === "string" && rule.color.trim()
      ? rule.color
      : "#888888";

  const patterns = Array.isArray(rule.patterns)
    ? rule.patterns
        .filter((p): p is string => typeof p === "string")
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  return {
    id:
      typeof rule.id === "string" && rule.id.trim()
        ? rule.id
        : `rule-import-${Date.now()}-${index}`,
    name:
      typeof rule.name === "string" && rule.name.trim()
        ? rule.name.trim()
        : `Rule ${index + 1}`,
    environment: rule.environment,
    patterns,
    color,
    textColor:
      typeof rule.textColor === "string" && rule.textColor.trim()
        ? rule.textColor
        : contrastText(color),
    enabled: rule.enabled !== false
  };
}

function normalizeSettings(raw: unknown): ExtensionSettings {
  if (!raw || typeof raw !== "object") {
    throw new Error("Import file is missing settings");
  }

  const incoming = raw as Partial<ExtensionSettings>;
  const defaults = cloneDefaults();

  if (!Array.isArray(incoming.rules) || incoming.rules.length === 0) {
    throw new Error("Import file must include at least one rule");
  }

  return {
    enabled: incoming.enabled ?? defaults.enabled,
    bannerEnabled: incoming.bannerEnabled ?? defaults.bannerEnabled,
    badgeEnabled: incoming.badgeEnabled ?? defaults.badgeEnabled,
    productionWarningEnabled:
      incoming.productionWarningEnabled ?? defaults.productionWarningEnabled,
    warningCooldownMinutes:
      typeof incoming.warningCooldownMinutes === "number" &&
      incoming.warningCooldownMinutes > 0
        ? incoming.warningCooldownMinutes
        : defaults.warningCooldownMinutes,
    rules: incoming.rules.map((rule, index) => normalizeRule(rule, index))
  };
}

/** Build a shareable export payload from current settings. */
export function buildSettingsExport(
  settings: ExtensionSettings
): SettingsExportFile {
  return {
    format: SETTINGS_EXPORT_FORMAT,
    version: SETTINGS_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    settings: structuredClone(settings)
  };
}

/**
 * Parse and validate a JSON import (full export file or bare settings object).
 */
export function parseSettingsImport(jsonText: string): ExtensionSettings {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error("File is not valid JSON");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Import file has an invalid shape");
  }

  const obj = parsed as Record<string, unknown>;

  // Preferred: versioned export file
  if (obj.format === SETTINGS_EXPORT_FORMAT || obj.settings) {
    if (
      obj.format &&
      obj.format !== SETTINGS_EXPORT_FORMAT
    ) {
      throw new Error(
        `Unrecognized format "${String(obj.format)}". Expected "${SETTINGS_EXPORT_FORMAT}".`
      );
    }
    return normalizeSettings(obj.settings);
  }

  // Also accept a bare settings object teammates might hand-edit
  if ("rules" in obj) {
    return normalizeSettings(obj);
  }

  throw new Error(
    "Unrecognized file. Export from this extension, or provide a JSON object with a rules array."
  );
}

export function downloadSettingsExport(settings: ExtensionSettings): void {
  const payload = buildSettingsExport(settings);
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const stamp = new Date().toISOString().slice(0, 10);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `wew-settings-${stamp}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function readSettingsFile(file: File): Promise<ExtensionSettings> {
  const text = await file.text();
  return parseSettingsImport(text);
}
