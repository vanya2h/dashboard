# Shared cached streams: module cache + nonce retry + errors-as-next

When multiple components/mounts can share an in-flight or completed stream (e.g. an LLM SSE response), cache it at module scope and design retry/errors so subscriptions survive across both.

## Pattern (`src/lib/llmStream.ts`)

```ts
const cache = new Map<string, LlmStream>();

export function getLlmStream(key: string, fetcher: LlmFetcher): LlmStream {
  const cached = cache.get(key);
  if (cached) return cached;

  const nonce$ = new BehaviorSubject(0);
  const state$ = nonce$.pipe(
    switchMap(() => createStream(fetcher)),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  const stream: LlmStream = { state$, retry: () => nonce$.next(nonce$.value + 1) };
  cache.set(key, stream);
  return stream;
}
```

Inside `createStream`, errors are emitted as next-values, never via the error channel:

```ts
catch (err) {
  subscriber.next({ status: "error", error: err });
  subscriber.complete();
}
```

## Rules

- **Module-level `Map<string, Stream>`** keyed by stable inputs (e.g. `study-plan:${locale}:${taskId}`). Same key → same stream instance.
- **`shareReplay({ bufferSize: 1, refCount: false })`** keeps the source alive across mount/unmount cycles and replays the latest emission to late subscribers.
- **Retry via `BehaviorSubject` nonce + `switchMap`** — `nonce$.next()` re-runs the inner factory; `switchMap` unsubscribes the previous attempt cleanly.
- **Emit errors as next-values, not channel errors** — `next({ status: "error", error })` then `complete()`. A channel error tears down all subscribers; a next-value keeps the subscription alive so the next `nonce$.next()` flows through to existing renderers.

## Why

- The cache prevents duplicate work when the same content is requested twice (e.g. user navigates away and back).
- `refCount: false` means the source doesn't tear down when the last subscriber unmounts — important for SSE streams where re-fetching is expensive.
- Errors-as-next-values is the key insight: it lets retry restart the stream without requiring the renderer to re-subscribe to a brand-new observable, which would otherwise reset Pending state and lose the user's place.

## Consumer side

Consumers subscribe via `<Pending value$={stream.state$}>` (see `late-unwrapping-pending.md`) and call `stream.retry()` from error-state UI.
