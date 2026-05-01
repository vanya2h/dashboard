# TypeScript Rules

## Prisma client import

The generated client lives at a non-standard path. Always import from:

```ts
import { ... } from "@prisma/client-generated";
```

Never use `@prisma/client`.

## Prisma client singleton

Use the singleton from `src/server/db.ts`, not `new PrismaClient()` directly:

```ts
import { db } from "../../src/server/db";
```

## No `any`

Never use `any`. If a type is genuinely unknown use `unknown` and narrow it.

## Type-only imports

Always use `import type` for imports that are only used as types:

```ts
import type { Skill } from "../data/types";
```

## Dictionaries / const maps

Use `as const satisfies` instead of an explicit type annotation on const object literals. This preserves narrow literal types while still validating the shape at compile time:

```ts
// bad — values widened to string, no narrow inference
const PHASE_ROUTES: Record<PhaseName, string> = { assessing: "assess", ... };

// good — values stay as literal types, shape still checked
const PHASE_ROUTES = {
  assessing: "assess",
  ...
} as const satisfies Record<PhaseName, string>;
```

## No re-exports

Import from the canonical source directly. Never re-export a type or value just to proxy it through another module:

```ts
// bad — useProgress.ts re-exporting StepKey it didn't define
export type { StepKey } from "../lib/phase";

// good — import from lib/phase wherever StepKey is needed
import type { StepKey } from "../lib/phase";
```

## Exhaustive union handling

When switching over a union type, always add a `default` branch that assigns to `never`. This causes a compile error if a new union member is added without updating the switch:

```ts
// bad — silent at compile time if a new case is added
switch (session.name) {
  case "study": return "Study";
  case "hands-on": return "Practice";
  // forgot "feedback" — no error
}

// good — compile error if any case is missing
switch (session.name) {
  case "assessing":   return "Assessing";
  case "gaps-review": return "Assessment done";
  case "study":       return "Study";
  case "hands-on":    return "Practice";
  case "feedback":    return "Feedback";
  case "write-up":    return "Write-up";
  default: {
    const _exhaustive: never = session.name;
    return _exhaustive;
  }
}
```

Apply this pattern whenever branching on a discriminated union (phase names, status enums, action types, etc.).

## React Router generated types

For route loader/action args always import the generated types:

```ts
import type { Route } from "./+types/route-name";

export async function loader({ request, params }: Route.LoaderArgs) { ... }
```

Run `react-router typegen` (via `pnpm --filter web run typecheck`) before using these types — they are generated, not hand-written.
