# dashboard-and-playwright

A microservices observability dashboard built with React + Vite + Tailwind, paired with a Playwright e2e suite that exercises it. Two sibling projects in one repo:

```
dashboard-and-playwright/
├── base-dashboard/      → the React dashboard (Turborepo + npm workspaces)
├── playwright/          → Chromium e2e tests against the dashboard
└── .github/workflows/   → CI: runs the Playwright tests on every push and PR
```

## What's in the dashboard

`base-dashboard/apps/web` is the user-facing app. The home page is an observability overview for a fictional fleet of microservices, composed of five widgets:

- **Throughput tiles** — current RPS, p95 latency, error rate, with delta vs. previous window and a sparkline.
- **Latency chart** — p50/p95/p99 lines, filterable by service.
- **Errors (5xx) chart** — area chart of error counts, filterable by service.
- **Service health grid** — one card per service with status, version, uptime, and a sparkline.
- **Distributed traces waterfall** — recent traces on the left, span timeline on the right.

All data is mocked and **deterministic** (`base-dashboard/apps/web/src/lib/metrics/mock-client.ts`) — the same RNG seed produces the same chart values every render. The mock layer sits behind a typed `MetricsClient` interface so a real backend (Prometheus, Datadog, etc.) can be swapped in later as a drop-in replacement.

The UI is built on [Base UI](https://base-ui.com) primitives (`@base-ui/react`) with Tailwind v4. The shared component library lives in `base-dashboard/packages/ui`.

## What's in the Playwright suite

`playwright/tests/` contains 8 Chromium tests across 4 spec files:

- `overview.smoke.spec.ts` — page loads, all five widgets render, no console errors.
- `charts.spec.ts` — service-selector interaction on the latency and error charts.
- `traces.spec.ts` — recent-trace list, click-to-select, waterfall update.
- `theme.spec.ts` — dark/light theme toggle.

Tests rely on the deterministic mock data, so they're stable run-to-run with no stub server, no fixtures, and no `data-testid` attributes added to source code.

## Running locally

### Prerequisites

- Node.js **20+**
- npm **11+** (ships with Node 20)

### 1. Install dependencies

```bash
# Dashboard
cd base-dashboard
npm install

# Playwright (in a separate shell or after the above)
cd ../playwright
npm install
npx playwright install chromium
```

### 2. Run the dashboard

```bash
cd base-dashboard
npm run dev
```

Open **http://localhost:5173** in your browser. Press `d` to toggle dark mode.

Other useful commands from `base-dashboard/`:

```bash
npm run build       # production build
npm run typecheck   # tsc --noEmit across workspaces
npm run lint        # eslint across workspaces
npm run format      # prettier write
```

### 3. Run the Playwright tests

From `playwright/`:

```bash
npx playwright test          # run all 8 tests headlessly
npx playwright test --ui     # open Playwright's interactive runner
npx playwright test --headed # watch the browser drive itself
npx playwright show-report   # open the HTML report after a CI-style run
```

Playwright will auto-start the Vite dev server (`webServer` config in `playwright.config.ts`). If `npm run dev` is already running, Playwright reuses it.

## Viewing test reports in GitHub Actions

Every push to `main` and every pull request triggers the **Playwright tests** workflow (`.github/workflows/playwright.yml`). After a run finishes, the HTML report is published as a downloadable artifact you can browse locally.

### Steps

1. Open the GitHub repository in your browser.
2. Click the **Actions** tab at the top.
3. In the left sidebar, select **Playwright tests** to filter to that workflow.
4. Click the run you're interested in (most recent at the top).
5. Scroll to the bottom of the run summary page. Under **Artifacts**, you'll see:
   - **`playwright-report`** — the full HTML report (uploaded on every run).
   - **`playwright-test-results`** — raw traces, screenshots, and videos (uploaded **only when tests fail**).
6. Click **`playwright-report`** to download it as a `.zip`.
7. Unzip it on your machine, then open the report — either:

   ```bash
   # From the unzipped folder
   npx playwright show-report .
   ```

   …or just double-click `index.html` in the unzipped folder.

The interactive HTML report shows each test's status, duration, retries, and — for failures — embedded screenshots, console output, and a downloadable **trace.zip**. To replay a trace step-by-step:

```bash
npx playwright show-trace path/to/trace.zip
```

This opens Playwright's trace viewer with DOM snapshots, network logs, and a frame-by-frame action timeline.

### Inline failure annotations

The workflow also uses Playwright's `github` reporter, so any failed assertions appear as **annotations directly on the workflow run page** and on the PR's "Files changed" tab — no need to download the artifact for a quick triage.

## Project documentation

- `.claude/CLAUDE.md` — guidance for Claude Code working in this repo (architecture overview, conventions, known caveats).
- `.claude/skills/base-ui/SKILL.md` — index of Base UI component docs.
