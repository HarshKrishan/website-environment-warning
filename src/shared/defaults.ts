import type { ExtensionSettings } from "./types";

export const ENV_TYPES = ["localhost", "staging", "production"] as const;

export const DEFAULT_SETTINGS: ExtensionSettings = {
  enabled: true,
  bannerEnabled: true,
  badgeEnabled: true,
  productionWarningEnabled: true,
  warningCooldownMinutes: 30,
  rules: [
    {
      id: "rule-localhost",
      name: "Localhost",
      environment: "localhost",
      patterns: ["localhost", "127.0.0.1", "*.local"],
      color: "#22c55e",
      textColor: "#052e16",
      enabled: true
    },
    {
      id: "rule-staging",
      name: "Staging",
      environment: "staging",
      patterns: ["*.staging.*", "staging.*", "*.dev.*", "*.test.*"],
      color: "#f59e0b",
      textColor: "#451a03",
      enabled: true
    },
    {
      id: "rule-production",
      name: "Production",
      environment: "production",
      patterns: [],
      color: "#ef4444",
      textColor: "#450a0a",
      enabled: true
    }
  ]
};

export function cloneDefaults(): ExtensionSettings {
  return structuredClone(DEFAULT_SETTINGS);
}
