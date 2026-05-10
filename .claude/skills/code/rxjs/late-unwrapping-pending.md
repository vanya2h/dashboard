# Late unwrapping with `<Pending>`

Pass `Observable<T>` down through your component tree. Unwrap **at the leaf that renders the value**, not at the top via `useObservable`.

```tsx
import { Pending } from "@vanya2h/utils-rxjs-react";

return (
  <PageBody>
    <Pending
      value$={viewState$}
      getDefaultValue={() => ({ material: initialMaterial, partIdx: initialPartIdx })}
    >
      {({ material, partIdx }) => /* render */}
    </Pending>
  </PageBody>
);
```

## Rules

- Prefer `<Pending value$={...}>` over `useObservable(...)` at the component top — the former scopes re-renders to the leaf; the latter re-renders the whole component on every emission.
- Always pass `getDefaultValue={() => initial}` when the underlying observable has a synchronous first value (use `startWith`). This makes SSR / first paint render real content instead of the `pending` fallback.
- For nested observables (a stream of streams), nest two `<Pending>` blocks — outer for the wrapper, inner for the inner state.
- If you need handler scope to reference resolved values (e.g. `material` and `partIdx` inside an `onClick`), do it inside the render-prop — don't lift them back up via `useObservable`.

## Why

The benefit is **scoped re-renders**: only the cell that consumes a value re-renders when it changes. Parents and siblings stay still. This compounds across a real app and avoids the "everything re-renders when the store updates" problem of top-level subscriptions.
