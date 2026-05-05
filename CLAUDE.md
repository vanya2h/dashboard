# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Code Standards Skill

Before making **any** code change, invoke the `/code` skill. It reads only the rule files relevant to what is being changed (CSS, TypeScript, React, React Router).

When the user gives feedback or instructions that establish a new coding rule or correct an existing one — e.g. "use X instead of Y", "never do Z", "always do W" — **update the relevant skill file** in `.claude/skills/code/` immediately after applying the change. The skill files are the source of truth for project conventions; keep them in sync.

## Definition of Done

A task is complete only after both pass with no errors:

```
pnpm --filter web run typecheck
pnpm run lint:fix
```

## Commands

```bash
# Root (runs across all packages via Turborepo)
pnpm dev                  # start all dev servers
pnpm build                # production build
pnpm lint                 # lint all packages
pnpm run lint:fix         # lint + auto-fix all packages

# Web package
pnpm --filter web run typecheck   # tsc --noEmit (after react-router typegen)
pnpm --filter web run dev         # Vite dev server with SSR

# Database (run from packages/web or via filter)
pnpm --filter web run db:generate # prisma generate
pnpm --filter web run db:migrate  # prisma migrate dev
pnpm --filter web run db:push     # prisma db push (no migration file)
pnpm --filter web run db:studio   # Prisma Studio UI
```

## Monorepo Structure

Turborepo + pnpm workspaces. One package under `packages/`:

| Package | Purpose                                                    |
| ------- | ---------------------------------------------------------- |
| `web`   | Full-stack app — React Router v7 (SSR) + Hono API + Prisma |

Environment variables are loaded from a root `.env` file (see `.env.example`). Required vars: `DATABASE_URL`, `BETTER_AUTH_API_KEY`, `BETTER_AUTH_URL`, `ANTHROPIC_API_KEY`.

## Web Package Architecture

### Routing layers

React Router v7 framework mode (SSR enabled). Two distinct layers share one Node.js server:

1. **Page routes** — `app/routes/*.tsx` with `loader()` / `action()` exports. Route config is in `app/routes.ts`.
2. **API routes** — `app/routes/api.ts` is a React Router wildcard that forwards all `/api/*` requests to a Hono app.

### API (Hono)

- Entry: `src/server/app.ts` — mounts auth and progress routers, sets global error handler.
- Routes: `src/server/routes/` (`chat.ts`, `progress.ts`).
- Public: `/api/auth/**` (Better Auth handles this natively).
- Protected: everything else goes through `requireAuth` middleware (`src/server/middleware/requireAuth.ts`), which reads the Better Auth session from the request.

### Auth (Better Auth)

- Config: `src/server/auth.ts` — `betterAuth` with `prismaAdapter`, email/password, 1-year sessions.
- For page routes: `src/server/session.ts` exports `requireSession()` — call in loaders, redirects to `/sign-in` if unauthenticated.
- For API routes: use the `requireAuth` Hono middleware.
- `auth.api.getSession()` is called independently in both layers (no shared session state).

### Database (Prisma v7)

- Schema: `prisma/schema.prisma`.
- Client generated to `node_modules/@prisma/client-generated` — import as `@prisma/client-generated`, not the standard `@prisma/client`.
- Client singleton: `src/server/db.ts` (cached on `globalThis` in non-production).
- Uses `PrismaPg` adapter with the `pg` driver.

**Progress-tracking models:**

- `TaskCompletion` — which task IDs a user has completed.
- `DailyActivity` — per-date record of `taskIds[]` completed that day (activity heatmap data).
- `Specialization` — user's chosen branch per curriculum.
- `AppSetting` — key/value store (e.g. `startedAt`).

### Client–server data flow

```
Root loader (app/root.tsx)
  → requireSession() + fetch progress from DB
  → returns { user, progress } as root loader data

React components
  → useRootData()         reads root loader data (via useRouteLoaderData("root"))
  → useProgress()         wraps mutations via Hono RPC client (hc<AppType>)
                          calls revalidate() after each mutation to re-run all loaders
```

### Hono RPC client

`src/lib/apiClient.ts` uses `hc<AppType>(origin)` for fully type-safe API calls from the browser. API types are inferred from the Hono app definition — no manual typing needed.

### Curriculum data

Learning content is defined statically in `src/data/curriculum.ts` and `src/data/curriculums/`. Tasks have string IDs referenced by `TaskCompletion` and `DailyActivity` — there is no `tasks` DB table. Task completion intensity (for the heatmap) is derived from `taskIds.length` in `DailyActivity`, not from logged minutes.

### Type-generated files

`react-router typegen` writes to `.react-router/types/` — these are committed-ignored but required for type-checking. Always run `typecheck` (which runs `typegen` first) rather than bare `tsc`.

## UI Layout — Border-Sliced Grid

Vercel-style layout: a single bordered column, horizontal section dividers, and bordered grids where cells share borders (no `gap-*`, no rounded chrome). Inspired by [DESIGN.md](DESIGN.md).

**Column wrapper** lives in `app/routes/app-layout.tsx` and wraps `<Header />` + `<Outlet />`. Pages do **not** add their own `max-w-*` or `border-x` — they render full-width inside the column:

```tsx
<div className="max-w-360 mx-auto border-x border-border min-h-screen">
  <Header />
  <Outlet />
</div>
```

**Section pattern** — a heading row with `border-b` separating it from the content, and a `border-b` on the section to separate from the next section:

```tsx
<section className="border-b border-border">
  <div className="px-6 py-4 border-b border-border">
    <Text variant="heading3" as="h2">Title</Text>
  </div>
  {/* content */}
</section>
```

**Bordered grid cells** — use `nth-child` variants to draw exactly one shared line per cell boundary. Always `border-b`; `border-r` is conditional on column position. The column's `border-x` provides the outer left/right edges, so rightmost cells get no `border-r`:

```tsx
const CELL_BORDERS = clsx(
  "border-b border-border",
  "sm:max-lg:odd:border-r",    // 2-col: only col 1 has right border
  "lg:not-nth-[3n]:border-r",  // 3-col: cols 1 and 2 have right border
);

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
  {items.map(item => (
    <div key={item.id} className={clsx(CELL_BORDERS, "bg-background hover:bg-muted/40 transition-colors")}>
      {/* cell content */}
    </div>
  ))}
</div>
```

Cells are flat — no rounded corners, no inner `border` chrome, no `gap-*` between them. Hover lifts use `bg-muted/40`. Semantic states (success/error coloring) keep their own borders since they encode meaning.
