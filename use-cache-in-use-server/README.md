# `"use cache"` inside `"use server"`, called from the client via SWR

Can a **Server Function** (file-level `"use server"`) also declare `"use cache"` in
its body, and be called from a Client Component through **SWR**?

## Setup

- `app/actions.ts` — file-level `'use server'` + a `fetcher()` whose body declares
  `'use cache'`. Returns a fetched value plus `cachedAt: new Date().toISOString()`.
- `app/swr-client.tsx` — `'use client'`, calls `useSWR('repo', () => fetcher())`.
- `next.config.ts` — `cacheComponents: true` (required for `use cache`).
- Next.js `16.3.0-canary.26`, React `19.2.6`, swr `2.4.1`.

```bash
pnpm install && pnpm build && pnpm start   # then open http://localhost:3123
```

## Result: it works, and the two directives coexist

1. **Compiles.** No "can't combine `use server` and `use cache`" error. `pnpm build`
   prerenders `/` as static.
2. **Callable from the client.** SWR invokes `fetcher()` as a Server Action — a real
   RPC round-trip (instrumented `window.fetch` shows `POST /`).
3. **Cached on the server.** `cachedAt` never changes:
   - frozen across repeated `mutate()` revalidations, and
   - frozen across a **full page reload** (which wipes SWR's in-memory client cache),
     so the stability comes from Next's server-side `use cache`, not from SWR.

So `fetcher` is simultaneously a Server Action (client-callable) **and** its body is
memoized by `use cache`. Each SWR call is a genuine server RPC that returns the cached
result.

```
initial : { "stars": 139598, "cachedAt": "2026-05-29T15:52:08.069Z" }
click x4: { "stars": 139598, "cachedAt": "2026-05-29T15:52:08.069Z" }   # mutate() -> POST /
reload  : { "stars": 139598, "cachedAt": "2026-05-29T15:52:08.069Z" }   # fresh SWR store
```

The dev server log shows the cache-hit timing signature — first call does the real
work, the rest are served from cache:

```
POST / 200 in 308ms (application-code: 306ms)   # 1st call: cache MISS, fetch ran
POST / 200 in  23ms (application-code:  19ms)   # cache HIT
POST / 200 in  10ms (application-code:   8ms)   # cache HIT
```

No warnings or errors in the build, dev/prod server logs, or browser console.

## Caveat

You still pay the **Server Action RPC on every SWR call** (each is a `POST /`); what
`use cache` saves is the server-side recompute/fetch, not the round-trip. The default
cache profile is stale 5min (client) / revalidate 15min (server), so `cachedAt` won't
move within that window — add `cacheLife('seconds')` inside `fetcher` to watch it
change. Combining file-level `"use server"` with inline `"use cache"` isn't explicitly
documented, but it compiles and behaves correctly on `16.3.0-canary.26`.

---

# The real catch: client calls share the Server Action queue (`/queue`)

The caveat above (an RPC per call) hides a bigger one. Every server function called
from the client — including a `"use cache"` read — goes through React's
`callServer` → Next's **App Router action queue**, which runs **strictly
sequentially**. So cache reads from the client interfere with each other and with real
mutations.

**Mechanism** (`node_modules/next/dist/client`, traced + instrumented):
`callServer` (`app-call-server.js`) dispatches `ACTION_SERVER_ACTION`. `dispatchAction`
(`components/app-router-instance.js`) is a linked-list queue: an empty queue runs
immediately, `ACTION_NAVIGATE`/`ACTION_RESTORE` preempt, **everything else is appended
to `last.next`**. The network `POST` in `fetchServerAction`
(`router-reducer/reducers/server-action-reducer.js`) only fires when the action is
**dequeued/run** — not when you call it. There is **no cache-read un-queueing** in this
version.

`app/queue` is a harness that measures this. Red bars = server-fn calls; blue =
`/api/work` Route-Handler control (same delays, not on the queue). Layer 1 wraps
`window.fetch`; `scripts/instrument.mjs` adds Layer-2 `[ACTQ]` logs inside Next.

### Q1 — preload during render, *not* awaited, behind a slow action → still blocked

Kick off a slow action (4s), then ~50ms later *preload* a 200ms `cachedRead` (hand the
promise to `<Suspense>`, never awaited). The preload's network does **not** start until
the slow action finishes:

```
                 called    network-fired    resolved
blocker (action)   0ms        2ms            4009ms
q1-read (preload) 52ms      4011ms  ← +3959ms 4222ms     content gated on slow action
# control (Route Handlers): q1-read fires at 52ms, resolves 260ms (concurrent)
```

Internal `[ACTQ]` trace confirms why: `enqueue:queued` at dispatch, then `fetch:start`
only after the blocker's `run:complete`. **Preloading buys nothing while an action is
in flight — the fetch can't start until the queue drains.**

### Q2 — fan-out revalidation, one slow → blocks all dispatched after it

Fire three reads A(200ms), B(4000ms), C(200ms) "simultaneously" (distinct cache keys):

```
server-fn:  A [9→236]  B [237→4245]  C [4246→4456]   strictly serial, total ≈ Σ ≈ 4456ms
            (C needs 210ms but resolves at 4456ms — it waited the full ~4s behind B)
control  :  A [0→219]  B [2→4020]    C [2→220]        overlapping,    total ≈ max ≈ 4020ms
```

The Route-Handler control runs 3 concurrently (so it isn't the browser's connection cap
or the server — 3 ≪ 6), isolating the **action queue** as the cause.

### Answers

- **Q1: yes** — a preloaded-but-not-awaited client cache read is queued behind an
  in-flight action; its fetch starts only after the action completes, delaying the
  dependent render by the action's duration.
- **Q2: yes** — client-side revalidations are serialized FIFO; one slow read blocks
  every read dispatched after it (latency ≈ sum, not max).

This matches the guidance that calling `"use cache"` directly from the client isn't a
good pattern yet — the building blocks (un-queued router/server *queries*) aren't here
in `16.3.0-canary.26`.

### Reproduce

```bash
pnpm install && pnpm build && PORT=3126 pnpm start   # open http://localhost:3126/queue
# optional Layer-2 internal queue logs:
node scripts/instrument.mjs            # patch node_modules (CJS+ESM client)
rm -rf .next && pnpm build && PORT=3126 pnpm start    # [ACTQ] logs appear in console
node scripts/instrument.mjs --revert   # restore node_modules
```
