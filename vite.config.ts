import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import { fileURLToPath, URL } from "node:url";
import manifest from "./manifest.config";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      input: {
        warning: fileURLToPath(
          new URL("./src/warning/index.html", import.meta.url)
        )
      }
    }
  },
  // silence unused in some tooling paths
  root: rootDir
});
