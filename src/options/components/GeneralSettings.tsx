import type { ExtensionSettings } from "@/shared/types";

interface GeneralSettingsProps {
  settings: ExtensionSettings;
  onChange: (patch: Partial<ExtensionSettings>) => void;
}

export function GeneralSettings({ settings, onChange }: GeneralSettingsProps) {
  return (
    <section className="panel">
      <h2>General</h2>
      <div className="toggles">
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => onChange({ enabled: e.target.checked })}
          />
          <span>Enable extension</span>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.bannerEnabled}
            onChange={(e) => onChange({ bannerEnabled: e.target.checked })}
          />
          <span>Show page banner</span>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.badgeEnabled}
            onChange={(e) => onChange({ badgeEnabled: e.target.checked })}
          />
          <span>Show toolbar badge</span>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.productionWarningEnabled}
            onChange={(e) =>
              onChange({ productionWarningEnabled: e.target.checked })
            }
          />
          <span>Warn before opening production</span>
        </label>
      </div>
      <label className="field">
        <span>Production warning cooldown (minutes)</span>
        <input
          type="number"
          min={1}
          max={1440}
          value={settings.warningCooldownMinutes}
          onChange={(e) =>
            onChange({
              warningCooldownMinutes: Number(e.target.value) || 30
            })
          }
        />
      </label>
    </section>
  );
}
