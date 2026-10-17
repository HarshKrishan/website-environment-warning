# Website Environment Warning

Chrome extension that shows a clear **page banner** and **toolbar badge** based on the current URL, so developers don’t accidentally use production instead of staging or localhost.

Built with **React**, **TypeScript**, **Vite**, and Manifest V3.

For a deeper write-up of the architecture, stack, and how each feature was implemented, see **[docs/HOW_WE_BUILT_THIS.md](docs/HOW_WE_BUILT_THIS.md)**.

## Features

- Configure hostname rules for **localhost**, **staging**, and **production**
- Assign a **different color** to each environment (banner + badge)
- Optional **warning screen before opening production** URLs
- Popup to see the current environment and toggle the extension on/off
- Options page to add, reorder, and edit rules (`*` wildcards supported)

---

## Prerequisites (system setup)

Install these on your machine before cloning or developing:

| Tool | Version | Notes |
| --- | --- | --- |
| [Node.js](https://nodejs.org/) | 18+ (LTS recommended) | Required for tooling |
| [Yarn](https://yarnpkg.com/) | 1.x (Classic) or Berry | Package manager for this project |
| [Google Chrome](https://www.google.com/chrome/) | Latest | Or Chromium / Edge (Chromium) |
| Git | Optional | Only needed to clone the repo |

### Check that Node and Yarn are available

```bash
node -v
yarn -v
```

If Node is missing, install it from [nodejs.org](https://nodejs.org/) or via [nvm](https://github.com/nvm-sh/nvm):

```bash
nvm install --lts
nvm use --lts
```

If Yarn is missing, install it with one of:

```bash
# via Corepack (ships with modern Node)
corepack enable
corepack prepare yarn@stable --activate

# or via npm (one-time global install)
npm install -g yarn
```

---

## Setup (first time on your system)

> **Important:** run all commands from the extension folder  
> `website-environment-warning/` — **not** the parent `extensions/` folder.  
> There is no `package.json` in `extensions/`, so `yarn` / `npm` will fail there.

1. **Enter the project**

   ```bash
   cd /path/to/extensions/website-environment-warning
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

   This installs React, Vite, TypeScript, `@crxjs/vite-plugin`, and Chrome type definitions into `node_modules/`.

3. **Build or start the extension** (see next section)

You only need to run `yarn install` again when `package.json` / `yarn.lock` changes.

---

## How to run

### Option A — Development (recommended while coding)

Starts Vite in watch mode and outputs the extension into `dist/`. Changes rebuild automatically; reload the extension in Chrome to pick them up.

```bash
cd website-environment-warning
yarn dev
```

Leave this terminal running while you develop.

### Option B — Production build

Type-checks and creates an optimized build in `dist/`:

```bash
cd website-environment-warning
yarn build
```

Use this when you want a one-off loadable package (no watch process).

---

## How to load and check in Chrome

### 1. Load the unpacked extension

1. Open Chrome and go to: `chrome://extensions`
2. Turn on **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the **`dist`** folder inside this project:

   ```text
   website-environment-warning/dist
   ```

   Do **not** select the project root — Chrome needs the built `manifest.json` inside `dist/`.

5. Confirm **Website Environment Warning** appears in the list and is enabled

### 2. Pin the extension (optional)

Click the puzzle-piece icon in Chrome’s toolbar → pin **Website Environment Warning** so the badge is easy to see.

### 3. Quick smoke test

| Step | What to do | What you should see |
| --- | --- | --- |
| Local | Open `http://localhost:3000` (or any localhost URL) | Green **LOCAL** banner + `LOC` badge |
| Popup | Click the extension icon | Environment name / host, On/Off toggle |
| Settings | Popup → **Configure rules**, or right-click icon → **Options** | Rules list with colors and patterns |
| Production warn | Add a production pattern (e.g. `example.com`), save, then open that site | Confirm screen before the page loads |

If the banner or badge does not update after you edit code or settings:

1. Go to `chrome://extensions`
2. Click the **Reload** icon on this extension
3. Refresh the tab you are testing

During `yarn dev`, reload the extension after major changes (especially background / content script changes).

---

## Configure environments

1. Open the options page (**Configure rules** from the popup)
2. Add hostname patterns per environment, for example:
   - **Localhost:** `localhost`, `127.0.0.1`, `*.local`
   - **Staging:** `*.staging.example.com`, `staging.example.com`
   - **Production:** `example.com`, `www.example.com`, `app.example.com`
3. Pick a color for each rule
4. Click **Save**

Rules are evaluated **top to bottom**; the **first match wins**.

Patterns match the **hostname** only and support `*` wildcards.

### Share settings with teammates

On the options page, under **Share with teammates**:

1. **Export settings** — downloads a `wew-settings-YYYY-MM-DD.json` file
2. Send that file (Slack, email, repo, etc.)
3. Teammate opens options → **Import settings** → picks the file → **Save**

Import replaces the current rules/toggles in the editor; Save persists them to Chrome.

---

## Available scripts (Yarn)

| Command | Description |
| --- | --- |
| `yarn install` | Install dependencies |
| `yarn dev` | Dev server / watch build → `dist/` |
| `yarn build` | Typecheck + production build → `dist/` |
| `yarn preview` | Vite preview (rarely needed for extensions) |

---

## Project structure

```text
website-environment-warning/
├── public/icons/          # Extension icons
├── src/
│   ├── shared/            # Types, defaults, matching, settings, hooks, messaging
│   ├── background/        # Service worker (badge + production intercept)
│   ├── content/           # React in-page banner
│   ├── popup/             # React popup UI
│   ├── options/           # React settings (modular components)
│   └── warning/           # React production confirm page
├── dist/                  # Built extension (load this in Chrome)
├── manifest.config.ts     # Chrome manifest (typed)
├── vite.config.ts
├── package.json
├── yarn.lock
└── README.md
```

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `Could not read package.json` / `ENOENT` | You are in the wrong folder. `cd website-environment-warning` then retry |
| **Load unpacked** fails / no `manifest.json` | Run `yarn build` or `yarn dev` first, then select `dist/` |
| Banner never shows | Check that a rule matches the hostname; enable “Show page banner” in options; reload the extension |
| Production warning never appears | Enable “Warn before opening production”; ensure the URL matches a **production** rule; wait out any “don’t warn again” cooldown |
| Changes not visible after edit | Reload the extension on `chrome://extensions`, then hard-refresh the page |
| `yarn install` fails | Confirm Node 18+ and Yarn with `node -v` / `yarn -v`; delete `node_modules` and retry |

---

## License

Private / local project — adjust as needed for your team.
