# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

The outer directory `test-automation-playwright/` is a git repo that currently contains a single nested project, `base-dashboard/`, which has its own `.git` directory. All real source code lives in `base-dashboard/`. Run all commands from there.

`base-dashboard/` is a **Turborepo + npm workspaces monorepo** using the shadcn/ui Vite template:

- `apps/web` — Vite + React 19 + TypeScript app (the consumer).
- `packages/ui` (`@workspace/ui`) — shared component library. Not built; consumers import directly from source via the `exports` map in `packages/ui/package.json` (`./components/*`, `./hooks/*`, `./lib/*`, `./globals.css`).

Because `@workspace/ui` exposes raw `.ts`/`.tsx` files, Tailwind v4 styles and TypeScript types resolve through the workspace symlink — there is no build step for the UI package. The web app's `tsc -b` build picks up types directly from source.

## Commands

Run from `base-dashboard/`:

```bash
npm run dev         # turbo dev — runs apps/web Vite dev server
npm run build       # turbo build — tsc -b && vite build for apps/web
npm run lint        # turbo lint — eslint across workspaces
npm run typecheck   # turbo typecheck — tsc --noEmit across workspaces
npm run format      # turbo format — prettier write
```

Scope a task to one workspace with turbo's filter, e.g. `npx turbo lint --filter=web` or `npx turbo typecheck --filter=@workspace/ui`.

Node `>=20` is required. Package manager is npm 11 (see `packageManager` field).

## shadcn/ui conventions

`apps/web/components.json` is configured so that `npx shadcn@latest add <component> -c apps/web` installs components into `packages/ui/src/components` (not into the app). Import them from the workspace package, never via relative paths:

```tsx
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
```

The shared global stylesheet lives at `packages/ui/src/styles/globals.css` and is imported by the web app. Tailwind config is colocated in CSS (Tailwind v4, no `tailwind.config.*` file).

## Notes

- The repo name suggests Playwright tests are planned, but no Playwright setup exists yet.
- `base-dashboard/` has its own `.git`; treat it as the working git repo for code changes.
