# RxJS in React Rules

These rules apply when using `rxjs` and `@vanya2h/utils-rxjs-react` to manage component state, derive observables, and run side effects. The exemplar implementation is `app/routes/topic.study.tsx` paired with `src/lib/llmStream.ts`.

| #   | Rule                  | Description                                                                                                       | File                         |
| --- | --------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| 1   | Late unwrapping       | Pass `Observable<T>` down; unwrap at leaves with `<Pending value$={...}>`; avoid `useObservable` at component top | `late-unwrapping-pending.md` |
| 2   | Shared cached streams | Module-level cache + `shareReplay({refCount:false})` + nonce retry + errors-as-next-values                        | `shared-cached-streams.md`   |
