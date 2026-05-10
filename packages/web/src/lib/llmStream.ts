import { type ClientResponse, parseResponse } from "hono/client";
import { BehaviorSubject, Observable, shareReplay, switchMap } from "rxjs";
import { readSSEStream } from "./claude";

export type LlmStreamState =
  | { status: "streaming"; text: string }
  | { status: "complete"; text: string }
  | { status: "error"; error: unknown };

export type LlmStream = {
  state$: Observable<LlmStreamState>;
  retry: () => void;
};

export type LlmFetcher = (signal: AbortSignal) => Promise<ClientResponse<unknown>>;

const cache = new Map<string, LlmStream>();

export function getLlmStream(key: string, fetcher: LlmFetcher): LlmStream {
  const cached = cache.get(key);
  if (cached) return cached;

  const nonce$ = new BehaviorSubject(0);
  const state$ = nonce$.pipe(
    switchMap(() => createStream(fetcher)),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  const stream: LlmStream = {
    state$,
    retry: () => nonce$.next(nonce$.value + 1),
  };

  cache.set(key, stream);
  return stream;
}

function createStream(fetcher: LlmFetcher): Observable<LlmStreamState> {
  return new Observable<LlmStreamState>((subscriber) => {
    const controller = new AbortController();

    void (async () => {
      subscriber.next({ status: "streaming", text: "" });
      try {
        const res = await fetcher(controller.signal);
        if (!res.ok) await parseResponse(res);
        if (!res.body) throw new Error("No response body");

        let acc = "";
        for await (const delta of readSSEStream(res.body)) {
          if (controller.signal.aborted) return;
          acc += delta;
          subscriber.next({ status: "streaming", text: acc });
        }
        if (controller.signal.aborted) return;
        subscriber.next({ status: "complete", text: acc });
        subscriber.complete();
      } catch (err) {
        if (controller.signal.aborted) return;
        subscriber.next({ status: "error", error: err });
        subscriber.complete();
      }
    })();

    return () => controller.abort();
  });
}
