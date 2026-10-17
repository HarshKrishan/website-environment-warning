export type EnvironmentType = "localhost" | "staging" | "production";

export interface EnvironmentRule {
  id: string;
  name: string;
  environment: EnvironmentType;
  /** Hostname patterns; supports `*` wildcards. */
  patterns: string[];
  color: string;
  textColor: string;
  enabled: boolean;
}

export interface ExtensionSettings {
  enabled: boolean;
  bannerEnabled: boolean;
  badgeEnabled: boolean;
  productionWarningEnabled: boolean;
  /** Minutes to skip production warnings for a host after "remember". */
  warningCooldownMinutes: number;
  rules: EnvironmentRule[];
}

export interface EnvironmentMatch {
  rule: EnvironmentRule;
  hostname: string;
}

export type RuntimeMessage =
  | { type: "GET_MATCH"; url: string }
  | {
      type: "CONTINUE_TO_PRODUCTION";
      tabId: number;
      targetUrl: string;
      hostname: string;
      remember: boolean;
    }
  | { type: "REFRESH_BADGE" };
