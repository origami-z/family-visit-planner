# Copilot / AI Agent Instructions for family-visit-planner

Purpose: short, action-oriented guidance so AI coding agents can be productive right away.

## Quick start (dev & test)

- Run the dev server: `npm run dev` (Vite, default port 3000).
- Build: `npm run build` (Vite; set `VITE_BASE_PATH` to support GitHub Pages).
- Preview build: `npm run preview`.
- Run tests: `npm run test` (Vitest, JSDOM). Use `npm run test -- --watch` for iterative work.
- Format & lint: `npm run format` (Prettier), `npm run lint` (ESLint), `npm run check` (`prettier --write . && eslint --fix`).

## Big picture & architecture

- Single-page client-only React + TypeScript app built with Vite and Tailwind.
- No server-side rendering; URL-based data import is supported via a special query param (see App import flow below).
- Global app state is in `src/context/FamilyPlannerContext.tsx` using React Context; components use `useFamilyPlanner()` to read/update state.
- UI primitives live under `src/components/ui/` (shadcn-like primitives). Use those instead of adding raw HTML + Tailwind when possible.
- Pages / sections are implemented as views under `src/components/*` (e.g., `dashboard/`, `members/`, `calendar/`, `settings/`). `src/App.tsx` switches sections via `activeSection` (no router).

## Important domain model & invariants

- Canonical types are in `src/types/planner.ts`.
  - Trips use `memberIds: string[]` (plural). Older shape `memberId` is migrated in `FamilyPlannerContext.migrateData()`.
  - Dates are stored as strings in `yyyy-MM-dd` format and manipulated with `date-fns` throughout the codebase (`parseISO`, `format`).
- Key localStorage key: `family-planner-data` (used for persistence and relied on in tests).
- The context exposes: `addMember`, `updateMember`, `deleteMember`, `addTrip`, `updateTrip`, `deleteTrip`, `importData`, `exportData`, `updateGlobalSettings`.

## Notable logic & helpers

- `src/hooks/usePlannerCalculations.ts` contains the core calculations: `useStayDuration`, `useEmptyDates`, and `useMemberStats`. These functions assume `yyyy-MM-dd` date strings and use date-fns intervals; test and extend them carefully.
- Data migration (currently only memberId → memberIds) is implemented in `FamilyPlannerContext.migrateData()` and writes back to localStorage when necessary.

## Testing & test patterns

- Tests use Vitest + @testing-library/react with the JSDOM environment. Add `/* @vitest-environment jsdom */` at top of files that need dom globals.
- Tests often seed `localStorage` directly (see `src/components/dashboard/DashboardView.test.tsx`) and clean up in `afterEach`.
- Be careful with `crypto.randomUUID()` used in the context — CI environments must support it or tests should mock it.

## Build / CI notes

- Vite's `base` is controlled by `VITE_BASE_PATH` for GitHub Pages. The README references a Pages workflow, but there is no `.github/workflows` directory in this repo; expect deployments to rely on that env var.

## Conventions & style to follow

- Use the `@/` import alias (tsconfig paths + `vite-tsconfig-paths` are configured).
- Prefer the provided UI components in `src/components/ui/` over adding new ad-hoc markup.
- Keep data migrations in `FamilyPlannerContext` and persist via the same `STORAGE_KEY` to avoid state mismatch with existing users.
- Follow existing test patterns (JSDOM, localStorage seeding), and add tests for complex date logic in `usePlannerCalculations`.
- Keep TypeScript strictness (project uses `strict: true`) and run `npm run check` before submitting changes.

## Things an agent should NOT do without confirmation

- Change the localStorage key or schema without adding a migration and a test.
- Replace the date string format — instead add a migration and update all callers.
- Remove the `import data` flow in `App.tsx` (the URL `?data=` behavior is user-facing for sharing/import).

## Helpful files to inspect when working on features/bugs

- `src/context/FamilyPlannerContext.tsx` (single source of truth for state & migration)
- `src/hooks/usePlannerCalculations.ts` (business logic around dates and usage limits)
- `src/types/planner.ts` (type definitions)
- `src/components/*` (examples of UI composition & usage of context)
- `package.json` (scripts)
- `tsconfig.json` (path aliases `@/*`)
