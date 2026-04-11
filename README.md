# dashboard-and-playwright

> 📊 **Live Allure test report:** **https://kevingomes17.github.io/dashboard-and-playwright/**
>
> Published from CI on every push to `main`. Shows the latest run grouped by epic/feature/story, severity badges, pass-rate and duration trend graphs across the last 30 runs, and per-test history. For details on how it's wired up, see the [Allure report](#allure-report-with-history) section below.

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

### 4. (Optional) View the Allure report locally

Every test run also produces Allure raw results in `playwright/allure-results/`. To view them as an HTML report:

```bash
cd playwright
npm run allure:serve              # one-shot: generate + open in your browser
# or
npm run allure:generate           # build playwright/allure-report/
npm run allure:open               # serve playwright/allure-report/
```

Allure's CLI is bundled via the `allure-commandline` npm dependency, but it's a Java app under the hood — you need a JRE on `PATH`. If `java -version` fails, install one with `brew install --cask temurin` (macOS) or your distro's package manager.

The Allure report adds severity/feature/owner grouping, history & trend graphs across runs (in CI), and behavior-driven navigation. It complements rather than replaces the built-in Playwright HTML report — for interactive **trace replay** of a failure, use `npx playwright show-trace` against the built-in report.

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

### Allure report (with history)

Alongside the built-in Playwright report, the workflow also publishes an **Allure report** with severity/feature/owner grouping and trend graphs across runs.

- **On every run** (push and PR), the report is uploaded as an artifact named **`allure-report`** at the bottom of the run summary page — same download/unzip flow as `playwright-report` above. Open `index.html` in any browser, no server needed.
- **On `main` pushes**, the same report is also published to **GitHub Pages**: **https://kevingomes17.github.io/dashboard-and-playwright/**. Each main push appends to the run history kept in the `gh-pages` branch, so the report's home page shows pass-rate trends, duration trends, and per-test history arrows. PRs do not update Pages — only artifact uploads.

**One-time setup the first time you push the workflow:** in the GitHub repo settings, enable **Pages → Source: Deploy from a branch → `gh-pages` / `(root)`**. The first workflow run on `main` creates the branch; until Pages is enabled the URL will 404. The workflow already has `permissions: contents: write` so the default `GITHUB_TOKEN` can push to `gh-pages`.

## Generating new Playwright tests with Claude Code

This repo is set up so you can author new e2e tests by **driving a real browser through Claude Code** instead of writing them by hand. Claude opens a browser via the global `playwright-cli` tool, you tell it what user flow to record, and it emits a complete Playwright spec into `playwright/tests/`.

### Prerequisites

1. **Claude Code CLI** — install per the [official instructions](https://docs.claude.com/claude-code).
2. **`playwright-cli` (global)** — a separate CLI that lets Claude open and interact with a real browser:
   ```bash
   npm install -g playwright-cli
   ```
3. **The `playwright-cli` skill** is already in this repo at `.claude/skills/playwright-cli/SKILL.md` (with reference docs under `.claude/skills/playwright-cli/references/`). Claude Code auto-discovers it when you run `claude` from the repo root.

### Workflow

1. Start the dashboard so there's something to test against:
   ```bash
   cd base-dashboard && npm run dev
   ```
2. In another terminal, from the **repo root**, start Claude Code:
   ```bash
   cd /path/to/dashboard-and-playwright
   claude
   ```
3. Ask Claude to generate a test, describing the flow in plain English. For example:
   > Generate a Playwright test that opens the dashboard, switches the latency chart to the `payments` service, and verifies the chart re-renders. Save it to `playwright/tests/payments-filter.spec.ts`.

   Behind the scenes Claude will:
   - Invoke the `playwright-cli` skill (the SKILL.md explains the available commands).
   - Run `playwright-cli open http://localhost:5173` to launch a browser.
   - Use `playwright-cli snapshot` to read the accessibility tree and find element refs.
   - Drive the page with `click`, `fill`, `select`, `hover`, etc. — every action prints the equivalent Playwright TypeScript code (`await page.getByRole(...).click()`).
   - Stitch the generated lines into a `@playwright/test` spec, applying this repo's conventions (scope queries to `page.locator("main")`, use `getByRole("combobox")` for Selects, use the deterministic mock data).
   - Write the file under `playwright/tests/` and run it once with `npx playwright test` to confirm it passes.

4. Review the generated spec, tweak as needed, and commit.

### Useful skill references

The `playwright-cli` skill ships with focused reference files Claude can pull in on demand:

- `.claude/skills/playwright-cli/references/test-generation.md` — how raw `playwright-cli` actions become Playwright TypeScript.
- `.claude/skills/playwright-cli/references/playwright-tests.md` — conventions for writing `@playwright/test` files.
- `.claude/skills/playwright-cli/references/element-attributes.md` — picking stable locators from the snapshot.
- `.claude/skills/playwright-cli/references/request-mocking.md`, `tracing.md`, `video-recording.md`, `storage-state.md`, `session-management.md`, `running-code.md` — situational helpers.

You can also tell Claude to consult them explicitly: *"Read `.claude/skills/playwright-cli/references/request-mocking.md` and stub the `/api/services` endpoint in this test."*

### Tips

- **Be specific about the assertion.** "Click the orders option and verify the trigger now reads `orders`" produces a tighter test than "test the dropdown".
- **Point Claude at an existing spec** (e.g. `playwright/tests/charts.spec.ts`) and ask it to follow the same patterns — it'll match the locator scoping and helper style automatically.
- **Run the test before committing.** Ask Claude to execute `npx playwright test path/to/new.spec.ts` and iterate if it fails. The deterministic mock client (`base-dashboard/apps/web/src/lib/metrics/mock-client.ts`) means a passing run is a stable run.

## Project documentation

- `.claude/CLAUDE.md` — guidance for Claude Code working in this repo (architecture overview, conventions, known caveats).
- `.claude/skills/base-ui/SKILL.md` — index of Base UI component docs.
- `.claude/skills/playwright-cli/SKILL.md` — browser automation commands for generating Playwright tests.

