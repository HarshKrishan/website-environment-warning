import { useRef, type ChangeEvent } from "react";
import {
  downloadSettingsExport,
  readSettingsFile
} from "@/shared/settingsTransfer";
import type { ExtensionSettings } from "@/shared/types";

interface ImportExportSettingsProps {
  settings: ExtensionSettings;
  onImport: (settings: ExtensionSettings) => void;
  onError: (message: string) => void;
  onInfo: (message: string) => void;
}

export function ImportExportSettings({
  settings,
  onImport,
  onError,
  onInfo
}: ImportExportSettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      downloadSettingsExport(settings);
      onInfo("Settings exported — share the JSON file with teammates");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Export failed");
    }
  };

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const imported = await readSettingsFile(file);
      const replace = confirm(
        `Import ${imported.rules.length} rule(s) from "${file.name}"?\n\nThis will replace your current settings in this editor. Click Save afterward to keep them.`
      );
      if (!replace) return;
      onImport(imported);
      onInfo("Settings imported — click Save to apply");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Import failed");
    }
  };

  return (
    <section className="panel">
      <h2>Share with teammates</h2>
      <p className="hint">
        Export your rules and toggles as a JSON file, or import a file a
        teammate shared. After import, click <strong>Save</strong> to store them
        in Chrome.
      </p>
      <div className="import-export-actions">
        <button type="button" className="ghost" onClick={handleExport}>
          Export settings
        </button>
        <button type="button" className="ghost" onClick={handlePickFile}>
          Import settings
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => void handleFileChange(e)}
        />
      </div>
    </section>
  );
}
