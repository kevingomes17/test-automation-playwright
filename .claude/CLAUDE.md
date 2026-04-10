# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

```
dashboard-and-playwright/
  base-dashboard/        Turborepo + npm workspaces (apps/web, packages/ui)
  playwright/            Standalone Playwright e2e project (sibling, NOT a workspace member)
  .github/workflows/     GitHub Actions (playwright.yml)
  .claude/               CLAUDE.md, project skills (base-ui)
```

`base-dashboard/` is a **Turborepo + npm workspaces monorepo**:

- `apps/web` — Vite + React 19 + TypeScript dashboard.
- `packages/ui` (`@workspace/ui`) — shared component library. Not built; consumers import directly from source via the `exports` map in `packages/ui/package.json` (`./components/*`, `./hooks/*`, `./lib/*`, `./globals.css`). Tailwind v4 styles and TypeScript types resolve through the workspace symlink, so there is no build step for the UI package.

`playwright/` has its own `package.json`, `node_modules`, and `tsconfig.json`. It is **not** a member of `base-dashboard`'s workspaces — treat it as an independent project that happens to live in the same repo.

## Commands (from `base-dashboard/`)

```bash
npm run dev         # turbo dev — runs apps/web Vite dev server on :5173
npm run build       # turbo build — tsc -b && vite build for apps/web
npm run lint        # turbo lint — eslint across workspaces
npm run typecheck   # turbo typecheck — tsc --noEmit across workspaces
npm run format      # turbo format — prettier write
```

Scope to one workspace with turbo's filter, e.g. `npx turbo lint --filter=web` or `npx turbo typecheck --filter=@workspace/ui`. Node `>=20`. Package manager is npm 11.

## Playwright e2e tests (from `playwright/`)

Specs in `playwright/tests/`: `overview.smoke.spec.ts`, `charts.spec.ts`, `traces.spec.ts`, `theme.spec.ts`. 8 tests total, Chromium only.

```bash
npx playwright test          # run all tests
npx playwright test --ui     # interactive mode
npx playwright test --headed # watch the browser
npx playwright show-report   # open the HTML report after a CI-style run
```

Key facts about the setup:

- **Dev server is auto-managed.** `playwright.config.ts` has a `webServer` block that runs `npm run dev` in `../base-dashboard` and waits for `http://localhost:5173`. `reuseExistingServer: !process.env.CI` — locally it attaches to an already-running dev server, in CI it starts a fresh one.
- **Deterministic fixtures, no stub server.** All data comes from `MockMetricsClient` (`base-dashboard/apps/web/src/lib/metrics/mock-client.ts`) which uses a seeded `mulberry32` RNG, so charts and traces produce the same values every run. No `data-testid` attributes were added to source — tests use text and ARIA roles.
- **Locator strategy:** scope queries to `page.locator("main")` because the sidebar nav has its own "Services"/"Traces" buttons that collide with widget headings. For base-ui Selects, use `getByRole("combobox")` for the trigger and `getByRole("option", { name, exact: true })` for items — the popup is rendered into a portal, so options must be queried from `page` (not from inside the card).

## CI

Workflow: `.github/workflows/playwright.yml` (in the **outer** repo, not inside `base-dashboard/`). Runs on push to `main` and on all PRs. Steps: checkout → setup-node 20 with npm cache for both lockfiles → `npm ci` in `base-dashboard` → `npm ci` in `playwright` → `npx playwright install --with-deps chromium` → `npx playwright test` → upload `playwright-report/` always, upload `test-results/` on failure.

**⚠️ Known prerequisite (currently unresolved):** `base-dashboard/` is a nested git repo with its own `.git` and no remote. The outer repo (the one with the GitHub `origin`) does **not** track any files inside `base-dashboard/` — `git ls-files base-dashboard` returns empty. Until that's resolved (`rm -rf base-dashboard/.git` and absorb, or convert to a submodule), GitHub Actions will check out an empty `base-dashboard/` and the workflow will fail at the first `npm ci`. Code commits today land in the inner repo, not the GitHub one.

## UI components

The project pivoted away from shadcn-style wrappers in favor of using `@base-ui/react` directly. `base-dashboard/packages/ui/src/components/` now contains only **`button.tsx`, `card.tsx`, `select.tsx`** — everything else (`badge`, `chart`, `sidebar`, `tooltip`, etc.) was deleted.

- **New components should use `@base-ui/react` directly** (already a dependency of `@workspace/ui`). The base-ui skill at `.claude/skills/base-ui/SKILL.md` is the index of the official component docs — fetch the relevant `.md` URL with WebFetch when implementing one.
- The local `Select` wrapper takes `{ value, onChange, options }` and uses a render-function child on `<BaseSelect.Value>` to map raw values back to labels — base-ui's default renders the value string, which is almost never what you want.
- `Card`/`CardHeader`/`CardTitle`/`CardDescription`/`CardContent` are five trivial styled-div components, not based on base-ui (no equivalent exists — base-ui only ships components with non-trivial behavior).
- Tailwind v4, config in CSS at `packages/ui/src/styles/globals.css`. Chart color tokens (`--chart-1`..`--chart-5`) and sidebar tokens are defined there.
- The `npx shadcn@latest add ... -c apps/web` command still works mechanically because `apps/web/components.json` is still in place, but **don't use it** — it'll repopulate the deleted wrappers and contradict the base-ui direction.

## Dashboard content & data layer

`apps/web/src/App.tsx` mounts `<Tooltip.Provider><AppSidebar /><AppHeader /><OverviewPage /></Tooltip.Provider>` inside the existing `ThemeProvider`. The overview page (`apps/web/src/pages/overview.tsx`) composes five widgets in `apps/web/src/components/widgets/`: `ThroughputTiles`, `LatencyChart`, `ErrorRateChart`, `ServiceHealthGrid`, `TraceWaterfall`. All are app-local (not in `@workspace/ui`).

All widget data flows through a singleton `metricsClient` (`apps/web/src/lib/metrics/index.ts`) typed against the `MetricsClient` interface (`client.ts`). The current implementation is `MockMetricsClient`; swapping in a real Prometheus/Datadog adapter is a drop-in. The mock client is **deterministic** — same inputs always produce the same chart values and traces, which is what makes the e2e tests stable.
