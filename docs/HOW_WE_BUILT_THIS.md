# How we built Website Environment Warning

This document explains **what we used**, **how the project is structured**, and **how each feature works**. For install / run / Chrome load steps, see the root [README.md](../README.md).

---

## Problem and product goals

Developers sometimes perform actions on **production** while thinking they are on **staging** or **localhost**.

We built a Chrome extension that:

1. Matches the current page hostname against configurable **environment rules**
2. Shows a colored **page banner** and **toolbar badge**
3. Optionally **intercepts navigations to production** and asks for confirmation
4. Lets teams **configure**, **persist**, and **share** those rules

---



## What we used (tech stack)


| Layer                | Choice                       | Why                                                                                    |
| -------------------- | ---------------------------- | -------------------------------------------------------------------------------------- |
| Extension platform   | **Chrome Manifest V3**       | Current Chrome extension standard (service worker, declared content scripts)           |
| UI                   | **React 19** + **React DOM** | Component-based UIs for options, popup, warning page, and in-page banner               |
| Language             | **TypeScript**               | Typed settings/rules, safer Chrome API usage                                           |
| Bundler / dev server | **Vite 6**                   | Fast rebuilds, multi-entry HTML pages                                                  |
| Chrome + Vite glue   | `@crxjs/vite-plugin`         | Turns the Vite app into a loadable extension (`dist/`), HMR-friendly dedicated entries |
| React in Vite        | `@vitejs/plugin-react`       | JSX/TSX transform                                                                      |
| Package manager      | **Yarn Classic (1.22)**      | Install / scripts (`yarn dev`, `yarn build`)                                           |
| Chrome typings       | `@types/chrome`              | Autocomplete and type-checking for `chrome.*` APIs                                     |
| Persistence          | `chrome.storage.sync`        | Rules/settings survive restarts; can sync across signed-in Chrome profiles             |
| Session state        | `chrome.storage.session`     | Production warning cooldowns / pending navigations (cleared with the browser session)  |




### Chrome permissions we declared


| Permission                     | Used for                                                                     |
| ------------------------------ | ---------------------------------------------------------------------------- |
| `storage`                      | Save/load settings; session cooldowns                                        |
| `tabs`                         | Badge updates, continue after production warning, popup active-tab detection |
| `webNavigation`                | Intercept top-frame navigations before production loads                      |
| `host_permissions: <all_urls>` | Match any site; inject content script / warning flow                         |


Defined in `manifest.config.ts` (typed via CRXJS `defineManifest`).

---



## How we structured the codebase

Modular by **concern**, not one large script:

```text
src/
  shared/                 # Reused across all entry points
    types.ts              # ExtensionSettings, EnvironmentRule, messages
    defaults.ts           # Default localhost / staging / production rules
    matching.ts           # Hostname pattern matching, labels, colors
    settings.ts           # load / save / subscribe via chrome.storage.sync
    settingsTransfer.ts   # Import / export JSON for teammates
    messaging.ts          # Typed chrome.runtime.sendMessage helpers
    hooks/useSettings.ts  # React hook for options / popup

  background/             # Service worker (no DOM)
    index.ts              # Listeners wiring
    badge.ts              # LOC / STG / PROD badge
    productionWarning.ts  # Navigation intercept + cooldown

  content/                # Injected into web pages (React)
    index.tsx             # Mount root into the page
    ContentApp.tsx        # Match URL, dismiss / re-show logic
    Banner.tsx            # Banner UI

  popup/                  # Extension action popup (React)
  options/                # Full settings page (React)
    components/           # GeneralSettings, RulesList, RuleCard, ImportExportSettings
  warning/                # Production confirm interstitial (React)

manifest.config.ts        # MV3 manifest source
vite.config.ts            # Vite + React + CRXJS + @ alias
```

**Shared logic** (matching, defaults, storage) is imported by background, content, popup, and options so behavior stays consistent.

Path alias: `@/*` → `src/*` (see `tsconfig.json` and `vite.config.ts`).

---



## Build and load pipeline

```text
Source (TS/TSX/HTML/CSS)
        │
        ▼
  yarn dev  /  yarn build
        │
        ▼
  Vite + @crxjs/vite-plugin
        │
        ▼
  dist/   ← load this folder in chrome://extensions
```

- `yarn dev` — watch mode; writes / updates `dist/`
- `yarn build` — `tsc --noEmit` then production Vite build

Chrome does **not** load the `src/` tree directly. Always **Load unpacked →** `dist/`.

---



## How each feature was built



### 1. Configurable environment rules

- **Model:** `EnvironmentRule` — name, environment type (`localhost` | `staging` | `production`), hostname `patterns[]`, color, enabled flag
- **UI:** Options page React components (`RulesList`, `RuleCard`) — edit, reorder, add, delete
- **Matching:** `matchEnvironment()` turns each pattern into a hostname regex (`*` → `.`*), first enabled match wins
- **Persistence:** entire settings object under `chrome.storage.sync` key `"settings"`



### 2. Different color per environment

- Stored on each rule (`color` / `textColor`)
- **Banner** uses CSS variables (`--wew-bg`, `--wew-fg`)
- **Badge** uses `chrome.action.setBadgeBackgroundColor` / `setBadgeTextColor`
- Contrast helper picks light/dark text for badges when needed



### 3. Page banner

- Content script mounts a React root (`#wew-root`) at `document_start`
- `ContentApp` loads settings, matches `location.href`, renders `Banner`
- Dismiss is **in-memory only** for the current tab view
- Banner **reappears** on tab focus / visibility change, URL change, or browser restart (not persisted dismiss)



### 4. Toolbar badge

- Background service worker updates badge on tab activate / URL update / settings change
- Short labels: `LOC`, `STG`, `PROD`



### 5. Warning before opening production

- `chrome.webNavigation.onBeforeNavigate` (main frame only)
- If URL matches a **production** rule and warning is enabled → redirect to extension `warning` page
- User can go back or continue; optional “don’t warn again for this host” uses **session** cooldown
- Pending-navigation map avoids redirect loops when continuing to the real URL



### 6. Import / export for teammates

- **Export:** versioned JSON (`format`, `version`, `exportedAt`, `settings`) downloaded as `wew-settings-YYYY-MM-DD.json`
- **Import:** parse + validate rules, load into the options editor, user clicks **Save** to persist
- Logic lives in `shared/settingsTransfer.ts`; UI in `ImportExportSettings`

---



## Data flow (high level)

```text
                    ┌─────────────────────┐
                    │  chrome.storage.sync │
                    │  key: "settings"     │
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
   Options (React)      Background SW          Content script
   edit / import        badge + warn           banner match
         │                     ▲                     │
         │                     │  runtime messages   │
         └─────────────────────┴─────────────────────┘
                               │
                          Popup (React)
                     show current match + toggle
```

---



## Design decisions (short)


| Decision                              | Rationale                                                       |
| ------------------------------------- | --------------------------------------------------------------- |
| React for UI surfaces                 | Modular components; easier options/import UX than raw DOM       |
| Shared matching module                | Same hostname rules for badge, banner, and production gate      |
| `storage.sync` for rules              | Persist + optional cross-device share via Chrome account        |
| `storage.session` for cooldowns       | Temporary; don’t permanently silence production warnings        |
| CRXJS instead of hand-rolled bundling | Manifest-aware multi-page extension build with less boilerplate |
| Yarn                                  | Team preference for installs/scripts; lockfile is `yarn.lock`   |


---



## What we did *not* use

- No backend / database — all config is local to the browser (plus optional Chrome sync)
- No UI component library — plain CSS per entry (popup / options / warning / banner)
- No test runner in the initial build — can be added later (e.g. Vitest for `matching` / `settingsTransfer`)

---



## Related docs


| Doc                       | Purpose                                                 |
| ------------------------- | ------------------------------------------------------- |
| [README.md](../README.md) | Setup, Yarn commands, load in Chrome, configure & share |
| This file                 | Architecture, stack, and how features were implemented  |


