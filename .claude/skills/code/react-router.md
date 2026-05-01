# React Router v7 Rules

## Route files live in `app/routes/`

Route config is in `app/routes.ts`. Adding a new route requires registering it there too.

## Auth in loaders

Every protected page route must call `requireSession` at the top of its loader:

```ts
import { requireSession } from "../../src/server/session";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await requireSession(request);
  // session.user is now available
}
```

`requireSession` redirects to `/sign-in` automatically — no need to handle the unauthenticated case.

## Generated route types

Always import args types from the generated file, not from react-router directly:

```ts
import type { Route } from "./+types/route-name";

export async function loader({ request, params }: Route.LoaderArgs) { ... }
export async function action({ request }: Route.ActionArgs) { ... }
```

## API routes go through Hono

Never put API logic directly into React Router actions if it belongs on `src/server/routes/`. Page actions (form submissions that redirect) are fine in route files. JSON API endpoints belong in Hono.

## Loader data in components

Use `useLoaderData` typed against the loader:

```ts
const data = useLoaderData<typeof loader>();
```

For root loader data use `useRootData()` (wrapper around `useRouteLoaderData("root")`).

## No fetcher for mutations that need full revalidation

Use the Hono RPC client via `useProgress()` for mutations that need to re-run all loaders after. Don't reach for `useFetcher` just to avoid a page reload — `revalidate()` is cheaper and keeps the data consistent.
