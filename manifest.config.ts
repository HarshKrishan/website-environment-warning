import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "Website Environment Warning",
  version: "1.0.0",
  description:
    "Show a clear banner and toolbar indicator so you never mistake production for staging or localhost.",
  permissions: ["storage", "tabs", "webNavigation"],
  host_permissions: ["<all_urls>"],
  background: {
    service_worker: "src/background/index.ts",
    type: "module"
  },
  action: {
    default_popup: "src/popup/index.html",
    default_title: "Website Environment Warning",
    default_icon: {
      "16": "public/icons/icon16.png",
      "32": "public/icons/icon32.png",
      "48": "public/icons/icon48.png"
    }
  },
  options_ui: {
    page: "src/options/index.html",
    open_in_tab: true
  },
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/content/index.tsx"],
      run_at: "document_start"
    }
  ],
  web_accessible_resources: [
    {
      resources: ["src/warning/index.html"],
      matches: ["<all_urls>"]
    }
  ],
  icons: {
    "16": "public/icons/icon16.png",
    "32": "public/icons/icon32.png",
    "48": "public/icons/icon48.png",
    "128": "public/icons/icon128.png"
  }
});
