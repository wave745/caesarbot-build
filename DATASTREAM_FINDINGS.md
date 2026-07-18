# CaesarX Datastream — integration findings

**Observed:** 2026-07-17 13:06:48 UTC (epoch_ms 1784293608278)
**Target:** `https://datastream.caesarx.trade`
**Context:** evaluating the datastream as a replacement for the Echo page's REST polling.
**Status:** integration is **blocked** — the API serves cached state correctly, but its ingest
pipeline has stopped producing new data.

Everything below was observed live, not inferred from the spec. Provenance is given per claim so
it can be re-verified. Facts are separated from hypotheses; the one hypothesis is labelled.

---

## 1. Summary

| | |
|---|---|
| API surface | Fits Echo well. Rooms map 1:1 to Echo's three columns; payload covers ~all of `TrenchesToken`. |
| Auth | None required. |
| Ingest | **Stalled ~103 min before observation.** Newest token in the feed is 103.4 min old. |
| Live WS events | **Zero** over a 60s observation across all three rooms. |
| `graduating` room | **Empty** (0 items) — backs Echo's "Nearly there" column. |
| Service process | Healthy: `running`, 15.74h uptime, 27,859 tokens in Redis, ClickHouse p50 65ms. |

The service ran normally for ~14h of its 15.74h uptime, then stopped ingesting ~1.72h ago.
This is a mid-flight failure, not a boot or config failure.

---

## 2. API reference (verified)

- **Spec:** `GET /openapi.json` — OpenAPI 3.0.3, "CaesarX Data API" v2.1.0.
  The `/docs` page is a Scalar SPA and returns only `<title>` to non-JS fetchers. **Fetch
  `/openapi.json` directly**; do not try to scrape `/docs`.
- **Auth:** none. `components.securitySchemes` is `null`, top-level `security` is `null`.
  All endpoints below were called unauthenticated and returned 200.
- **Servers:** prod `https://datastream.caesarx.trade`; local `http://localhost:3002` (API replica),
  `http://localhost:3000` (single process).
- **Architecture (per spec `info.description`):** raze gRPC stream → Anchor-discriminator
  instruction parser → Redis (live state) + ClickHouse (history/analytics).
- **Scope caveat:** endpoints returning `scope: "indexed-trades"` compute from a 90–180 day
  indexed window, not full chain history.

### WebSocket

Socket.IO v4, same host/port. Join with `socket.emit("join", "<room>")`. Envelope is
`{ type, room, data }` (except `tick`/`trade`, which are flat). Most rooms emit `snapshot` on
join, then live events.

Rooms relevant to Echo:

| Echo column | Room | Events |
|---|---|---|
| New | `new` (auto-joined) | `snapshot`, `message` |
| Nearly there | `graduating` | `snapshot`, `message` |
| Migrated | `graduated` | `snapshot`, `message` |

**Gotcha:** snapshot `data` is an **array of envelopes**, not an array of tokens. Each item is
itself `{ type, room, data }` and must be unwrapped (`item.data`) before use. This is not stated
in the spec — it was observed.

`GET /api/token/{mint}` returns the **same envelope shape** as the WS rooms, so one parser covers
REST and WS, and REST can seed the first paint before the socket connects.

---

## 3. Findings — datastream (external)

### DS-1 — Ingest pipeline stalled · CRITICAL · confirmed

The newest token the API knows about is 103.4 minutes old, and all 20 tokens on the first page of
newest-first were created inside a ~1 minute window. That distribution is the signature of ingest
stopping abruptly rather than slowing.

```bash
curl -s "https://datastream.caesarx.trade/api/tokens?limit=20&sort=created&status=new"
# total: 286
# newest token age: 103.4 min   oldest in page: 104.4 min
# all 20 rows: marketCapUsd 0, curvePercentage 0
```

Corroborating telemetry:

| Endpoint | Field | Value | Reads as |
|---|---|---|---|
| `/api/global/status` | `discovery.discoveries` | 12 | every attempt |
| `/api/global/status` | `discovery.failures` | 12 | …failed |
| `/api/global/status` | `discovery.successRate` | 0 | …none succeeded |
| `/api/global/status` | `clickhouse.ingest.inserted` | 0 | nothing written |
| `/api/global/status` | `clickhouse.ingest.queueDepth` | 0 | nothing queued either |
| `/api/global/status` | `watchedCount` / `maxCapacity` | 1 / 180 | 1% capacity used |
| `/api/streams/stats` | `total` | 0 | zero events compared |

Note `ingest.failed`, `dropped`, `rejected`, `deadletterDepth` are all **0** with `lastError: ""` —
nothing is erroring at the ingest stage. Combined with `queueDepth: 0`, this means ingest isn't
failing to write; **it is receiving nothing to write**. The failure is upstream of ClickHouse.

Contrast — the service process itself is healthy (`/api/stats`, `/api/global/status`):

```
status: "running"          uptime: 56655s (15.74h)
tokensInRedis: 27859       clickhouse.query: p50 65ms / p95 125ms / p99 154ms
rowCounts: trades 8,704,424 | candles_1m 164,208 | holder_snapshots 115,946
```

**Timing:** uptime 944.25 min, stall ≈ 103.4 min → the service ran clean for ≈ 840.9 min (14.0h),
i.e. ~89% of its uptime, then stopped. Rules out startup/config causes.

### DS-2 — No live WebSocket events · CRITICAL · confirmed · downstream of DS-1

Joined `new`, `graduating`, `graduated` and listened 60s with `onAny`. Snapshots delivered
normally; **zero** non-snapshot events. Connection itself is fine (`transport=websocket`).

```
SNAPSHOT new:        50 items  | statuses {new:46, graduated:4} | curve% min 0.0 max 21.0
SNAPSHOT graduating:  0 items
SNAPSHOT graduated:  49 items  | statuses {graduated:49}        | curve% min 0.0 max 100.0
=== LIVE EVENTS over 60s === (none)
```

Repro script: `/tmp/claude-1000/-home-caesa-caesarbot-build/bad72282-6d2a-4ab0-b7aa-040ebf86d69c/scratchpad/ws-probe2.js`
(run with `NODE_PATH=/home/caesa/caesarbot-build/node_modules node ws-probe2.js` — `socket.io-client`
is already a project dep).

For a pump.fun new-launch feed, zero launches in 60s is not plausible. Consistent with DS-1.

### DS-3 — `graduating` room is empty · BLOCKER · confirmed · downstream of DS-1

`graduating` returns a 0-item snapshot. Highest `curvePercentage` anywhere in `new` is 21% —
nothing is progressing up the bonding curve, because nothing new is entering the pipeline.

**Impact on this work specifically:** `graduating` backs Echo's "Nearly there" column. While it is
empty, its healthy payload shape cannot be observed, so that column cannot be built against a
verified contract — only guessed at.

### DS-4 — Solana RPC returning internal errors · SUSPECTED ROOT CAUSE · **hypothesis, unconfirmed**

From `/api/stats` → `rpcCalls`:

| Method | total | rpcErr | err rate | lastErr |
|---|---|---|---|---|
| `getTokenAccountsByOwner` | 99 | 61 | **61.6%** | `-32603: Internal JSON-RPC error.` |
| `getTokenLargestAccounts` | 4 | 3 | **75.0%** | `-32603: Internal JSON-RPC error.` |
| `getBalance` | 99 | 0 | 0% | — |
| `getSignaturesForAddress` | 20 | 0 | 0% | — |
| `getAccountInfo` | 4 | 0 | 0% | — |
| `getMultipleAccounts` | 2 | 0 | 0% | — |

**Not client-side rate limiting:** every bucket in `rpcLimiter` shows `droppedCount: 0`, and
`pool-discovery` is at full capacity (`tokens: 5, capacity: 5`) — nothing is being throttled.

**Hypothesis:** the RPC provider is failing specifically on token-account reads (`-32603` is a
provider-side internal error), which breaks pool/holder discovery (DS-1: 12/12 discovery failures),
so no token gets watched (`watchedCount: 1/180`), so nothing reaches ingest (`inserted: 0`).

**Confidence: moderate.** The correlation fits and the error is provider-side, but this cannot be
confirmed from outside the service. Two things argue for care: the failure is selective (`getBalance`
succeeds 99/99 while `getTokenAccountsByOwner` fails 61/99, though both are account reads), and the
sample sizes are small. Whoever owns the infra should check the RPC provider's status and the
discovery worker's logs before treating this as the cause.

### DS-5 — Payload enrichment is partial · MINOR · confirmed

Sampled token reports `meta.dataQuality: "partial"`, `fullyEnriched: false`, `hasPrice: false`.
Fields `marketCapUsd`, `volumeUsd`, `priceUsd` are `0` across the newest page. Likely a further
symptom of DS-1 (enrichment needs the same RPC/discovery path), but worth confirming it's not an
independent enrichment-lane problem. Relevant flags: `meta.hasPrice`, `hasBasicRisk`, `hasTop10`,
`hasRisk`, `hasImage`, `hasTopTraders`, `expectedRichBy`, `richPayloadDelay`.

---

## 4. Field mapping (verified against a live payload)

Sample mint: `CXMZdTTibL9f1mL1BCkpqEdbFYxyF9q6Nf4zXJgMpump` (via `GET /api/token/{mint}`).
Target interface: `TrenchesToken`, `components/trenches-page.tsx:45`.

| `TrenchesToken` | datastream path | verified value |
|---|---|---|
| `name` | `data.token.name` | `"IT"` |
| `symbol` | `data.token.symbol` | `"IT"` |
| `image` | `data.token.image` | ipfs URL |
| `contractAddress` | `data.token.mint` | ✅ |
| `mc` | `data.quote.marketCapInUsd` | `2791.47` |
| `volume` | `data.quote.volumeInUsd` | `0` |
| `fee` | `data.quote.feesInSOL` | `0` |
| `creationTime` | `data.pools[0].createdAt` | `1784288686365` (ms) |
| `holders` | `data.holderCount` | `1` |
| `buys` / `sells` | `data.pools[0].txns.buys` / `.sells` | `1` / `0` |
| `status` | `data.graduation.status` | `"new"` |
| `bondingCurveProgress` | `data.pools[0].curvePercentage` | `0` |
| `top10Holders` | `data.risk.top10` | `49.09` |
| `snipers` | `data.risk.snipers.count` | `0` |
| `insiders` | `data.risk.insiders.count` | `0` |
| `devHoldingsPercentage` | `data.risk.dev.percentage` | `0.11` |
| `devSold` | derive from `data.risk.dev.sellSol` | `0` |
| `dev` | `data.pools[0].deployer` | ✅ |
| `platform` | derive from `data.pools[0].market` (`"pumpfun"`) or `data.token.createdOn` | ✅ |
| `twitter` / `telegram` / `website` | `data.token.strictSocials.*` | empty string when absent — **not null** |

**Notes for the implementer:**
- `strictSocials` uses `""` for absent socials, not `null`. Echo's `hasTwitter`/`hasTelegram`/
  `hasWebsite` booleans must test for non-empty string, not existence.
- `data.quote.solPriceUsd` (`75.14` at sample time) ships on **every** token payload. This removes
  the need for a separate SOL price fetch entirely — see E-1.
- Timestamps: `pools[0].createdAt` is **ms**; `token.creation.created_time` is **seconds**. Don't
  mix them.
- Available but unused by Echo today: `risk.kol`, `risk.smartMoneyCount`, `risk.bundlesHolding`,
  `risk.suspicious.*`, `risk.score`, `token.imageHash` (copycat detection), `dev_stats`,
  `events.*.priceChangePercentage`.

---

## 5. Findings — Echo client (internal, independent of the datastream)

These predate the datastream work and are in our code, not theirs.

### E-1 — SOL price polled every 10ms · HIGH

`components/trenches-page.tsx:1288` — `setInterval(updateSolPrice, 10)`. The adjacent comment says
it matches token polling frequency; token pollers run at **1000ms**, so this is 100× faster than
its stated intent. An `isUpdating` guard prevents overlap, so in practice it issues
`/api/pump-fun/sol-price` back-to-back as fast as the network responds, with `cache: 'no-store'`,
for the lifetime of every open tab.

*Resolved by the migration:* `data.quote.solPriceUsd` arrives on every token payload — this whole
effect is deleted rather than tuned.

### E-2 — Customize settings do not persist · LOW

`components/trenches-page.tsx:1227` — `echoSettings` is `useState<EchoSettings | undefined>(undefined)`
with no `localStorage` in either `trenches-page.tsx` or `components/echo-customize-modal.tsx`. Hidden
columns and layout choices reset on every reload. Fallbacks are already written defensively
(`!== false`), so only persistence is missing.

*Independent of the migration* — fix separately.

### E-3 — Duplicated polling · MEDIUM

Five dedicated pollers at 1000ms — `trenches-page.tsx:864` (pump.fun), `:927` (bonk.fun), `:974`
(moon.it), `:1034` (pump.fun MC), `:1165` (pump.fun graduated) — plus `fetchAllDataInParallel()` on a
5000ms interval at `:1719` that re-fetches overlapping data. Every 5th second does roughly double
work. The comment at `:1718` claims "WebSocket handles NEW tokens in real-time", but there is no
WebSocket in this file — it appears to be a leftover from an earlier design.

*Resolved by the migration:* all six intervals collapse into three room subscriptions.

(Separately, `:329` ticks `currentTime` every 100ms to re-render token ages. Not a network cost;
leaving it alone.)

---

## 6. Current Echo topology (for orientation)

```
app/echo/page.tsx          → renders <TrenchesPage />        (5 lines)
app/trenches/page.tsx      → redirect('/echo')               (legacy route)
app/echo/layout.tsx        → metadata only
components/trenches-page.tsx    → TrenchesPage @ :298         (2353 lines)
components/trenches-column.tsx  → TrenchesColumn              (1544 lines)
components/trenches-card.tsx                                  (197 lines)
components/echo-customize-modal.tsx → EchoCustomizeModal      (400 lines)
```

`/echo` is canonical; "trenches" is the legacy name surviving in filenames. Data currently comes
from `lib/pump-api.ts` + local routes under `/api/pump-fun/*`. **No datastream code exists yet** —
nothing imports `pumpportal-api.ts`, `bitquery-service.ts`, or `helius-sdk` from the Echo path.
Deps already installed: `socket.io-client@^4.8.1`, `ws@^8.18.3`, `helius-sdk@^2.0.2`.
`.env.local` currently holds only `MORALIS_API_KEY` — the datastream needs no key.

---

## 7. Recommended sequence

1. **Owner confirms whether DS-1 is a genuine stall** or expected (paused worker, deliberate stop,
   raze gRPC credential expiry). Start with the RPC provider status and discovery worker logs per
   DS-4. This is infra-side and cannot be diagnosed from the client.
2. **Once ingest resumes, re-probe** to capture real live-event payloads and a non-empty
   `graduating` snapshot (`ws-probe2.js` above). Do not skip — DS-3 means one of the three columns
   currently has no observable contract.
3. **Then build** the parser + `TrenchesToken` mapping against verified shapes, and delete E-1/E-3.

**If work must start before ingest recovers:** the parser and field mapping can be written against
the REST endpoints and the snapshot shapes verified in §4, structured so the socket layer drops in
later. That is real progress and removes E-1/E-3 regardless. **But it cannot be tested end-to-end** —
with the feed dead there is no way to distinguish a bug in our code from an absence of data, and
the `graduating` shape would be a guess. Treat any such code as unverified until §7.2 completes.

---

## 8. Health-check commands

```bash
# is ingest alive? (the decisive check — compare newest createdAt to now)
curl -s "https://datastream.caesarx.trade/api/tokens?limit=5&sort=created&status=new"

# pipeline telemetry
curl -s https://datastream.caesarx.trade/api/global/status   # discovery.successRate, clickhouse.ingest.inserted, watchedCount
curl -s https://datastream.caesarx.trade/api/stats           # status, uptime, rpcCalls error rates
curl -s https://datastream.caesarx.trade/api/streams/stats   # geyser vs raze event totals

# the spec (NOT /docs — that's a client-rendered SPA)
curl -s https://datastream.caesarx.trade/openapi.json
```

**Healthy looks like:** newest token age < ~1 min · `discovery.successRate` > 0 ·
`clickhouse.ingest.inserted` climbing · `watchedCount` ≫ 1 · live `message` events within seconds
of joining `new`.
