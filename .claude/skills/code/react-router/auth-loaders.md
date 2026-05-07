# Auth in loaders

Every protected page route must call `requireSession` at the top of its loader:

```ts
import { requireSession } from "../../src/server/session";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await requireSession(request);
  // session.user is now available
}
```

`requireSession` redirects to `/sign-in?redirect=<original-path>` automatically. After auth the user lands back where they tried to go.

## Public routes

These routes are intentionally public — do **not** call `requireSession` in their loaders:

- `/` (home)
- `/curriculum/:curriculumId` (program detail; loader returns 404 via `throw new Response(null, { status: 404 })` for custom curriculums the visitor doesn't own, with a route `ErrorBoundary` rendering the 404 page)
- `/curriculum/new` (the builder UI renders for everyone; sign-in is triggered client-side from `useCurriculumBuilder.start()` when the user clicks Generate)

The principle: defer sign-in to the latest possible commitment moment. Anonymous users can browse programs and the builder form. Auth is required to actually start a topic, generate a custom program, or read/write progress data.
