import { useEffect, useState } from "react";
import { cloneDefaults } from "@/shared/defaults";
import { useSettings } from "@/shared/hooks/useSettings";
import { contrastText } from "@/shared/matching";
import type { EnvironmentRule, ExtensionSettings } from "@/shared/types";
import { GeneralSettings } from "./components/GeneralSettings";
import { ImportExportSettings } from "./components/ImportExportSettings";
import { RulesList } from "./components/RulesList";

function createRule(): EnvironmentRule {
  return {
    id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: "New rule",
    environment: "staging",
    patterns: [],
    color: "#f59e0b",
    textColor: "#451a03",
    enabled: true
  };
}

export function OptionsApp() {
  const { settings: stored, loading, saving, persist } = useSettings();
  const [draft, setDraft] = useState<ExtensionSettings | null>(null);
  const [toast, setToast] = useState<{ message: string; error?: boolean } | null>(
    null
  );

  useEffect(() => {
    if (stored && !draft) {
      setDraft(structuredClone(stored));
    }
  }, [stored, draft]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(id);
  }, [toast]);

  if (loading || !draft) {
    return <div className="options-app loading">Loading settings…</div>;
  }

  const patch = (partial: Partial<ExtensionSettings>) => {
    setDraft({ ...draft, ...partial });
  };

  const save = async () => {
    try {
      const next: ExtensionSettings = {
        ...draft,
        rules: draft.rules.map((rule) => ({
          ...rule,
          patterns: rule.patterns.map((p) => p.trim()).filter(Boolean),
          textColor: contrastText(rule.color)
        }))
      };
      await persist(next);
      setDraft(next);
      setToast({ message: "Settings saved" });
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : "Failed to save",
        error: true
      });
    }
  };

  const reset = async () => {
    if (!confirm("Reset all settings to defaults?")) return;
    const defaults = cloneDefaults();
    setDraft(defaults);
    await persist(defaults);
    setToast({ message: "Defaults restored" });
  };

  return (
    <div className="options-app">
      <header className="page-header">
        <div>
          <p className="eyebrow">Chrome extension</p>
          <h1>Website Environment Warning</h1>
          <p className="subtitle">
            Configure URL rules, colors, and production warnings so you never act
            on the wrong environment.
          </p>
        </div>
        <div className="header-actions">
          <button type="button" className="ghost" onClick={() => void reset()}>
            Reset defaults
          </button>
          <button
            type="button"
            className="primary"
            disabled={saving}
            onClick={() => void save()}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </header>

      {toast ? (
        <p className={`toast${toast.error ? " error" : ""}`}>{toast.message}</p>
      ) : null}

      <GeneralSettings settings={draft} onChange={patch} />

      <ImportExportSettings
        settings={draft}
        onImport={(imported) => setDraft(imported)}
        onError={(message) => setToast({ message, error: true })}
        onInfo={(message) => setToast({ message })}
      />

      <RulesList
        rules={draft.rules}
        onChange={(rules) => patch({ rules })}
        onAdd={() => patch({ rules: [...draft.rules, createRule()] })}
      />
    </div>
  );
}
