# Gate contract — every `window.__GAME__` field `tools/gate.mjs` reads

The engine agents implement FROM THIS FILE. Names are exact. Everything is refreshed every
rendered frame. Units are metres, seconds, and metres per second. Lanes are the integers
`-1 | 0 | 1` for x = -2, 0, +2.

The recipe's base contract (`pos, fps, speed, score, over, draws, tris`) is unchanged. The fields
below it are what SPEC.md "Telemetry" promised, plus four additions the gate could not do its job
without (marked NEW). Anything not listed here the gate ignores.

## Globals

| name | type | semantics | gate uses it for |
|---|---|---|---|
| `window.__READY__` | `true` once | loaded, scene built, `#startb` visible and startable | READY time (`< 20 s` under `--4g`); nothing is touched before it |
| `window.__START__` | function | begins play. **Last-resort fallback only**: the gate presses `#startb` with a real tap/click; if the game has not started 3 s later it taps once more, then calls this, reports it, and FAILS the run | the "real control did not start the game" failure |
| `window.__GAME__` | object | the telemetry below | everything |

## DOM the gate touches

| selector | what | gate uses it for |
|---|---|---|
| `#startb` | the start button on the title screen. Must be visible and have a non-zero box once `__READY__` is true; a real `click` event on it must start the game (a CDP touch tap produces one) | the real press |
| `#hud` | root element of the in-play HUD (score, coins, perf line). May contain anything | hidden with an injected `<style>` tag during `--clip` recording only |
| the canvas | must receive touch events (`touch-action: none`) anywhere in the middle of the screen; swipe threshold must be **≤ 40 px** because the gate swipes 90 px | swipes |

Swipes the gate dispatches (phone): `touchStart` at screen centre, 4 `touchMove` steps of ~22 px
each over ~100 ms, `touchEnd`, all through CDP `Input.dispatchTouchEvent`, so the page sees real
`touchstart/touchmove/touchend` AND the derived `pointerdown/pointermove/pointerup`. Desktop:
real `keydown`/`keyup` of `ArrowLeft / ArrowRight / ArrowUp / ArrowDown`.

## Base fields (recipe contract, unchanged)

| field | type | semantics | assertion |
|---|---|---|---|
| `pos` | `[x, z]` | player position in metres. `z` grows monotonically with distance run; `x` is the player's actual lateral position (eased during a lane change, so `|x - lane*2| < 0.2` means the change has finished) | distance fallback when `distance` is absent; lane-change completion |
| `fps` | number | from REAL elapsed time | captioned, never gated |
| `speed` | m/s | forward speed right now. 0 before start and after death | action distances scale with it |
| `score` | number | coins + metres/10 | printed |
| `over` | boolean | true from the moment of death until restart | stops the run; "dead before 400 m" |
| `draws` | number | `renderer.info.render.calls` for the last frame | peak ≤ 900 |
| `tris` | number | `renderer.info.render.triangles` for the last frame | peak ≤ 1.5M |

## Runner fields (SPEC.md "Telemetry")

| field | type | semantics | assertion |
|---|---|---|---|
| `lane` | `-1\|0\|1` | the player's **target** lane: updates the instant a lane swipe is accepted, not when the ease finishes | steering; never swipe toward the lane already targeted |
| `airborne` | boolean | true from take-off to landing | printed in decisions |
| `rolling` | boolean | true for the roll's 0.5 s | printed in decisions |
| `distance` | metres | metres run since the current run started (0 at start, resets on restart) | **distance ≥ 600 m**; photo distances 60/150/300/450/600/800; "not dead before 400 m" |
| `zone` | string | e.g. `'street_a' \| 'ramp_up' \| 'highway' \| 'ramp_down' \| 'street_b'` | caption under each frame |
| `coins` | integer | coins collected this run | **coins > 0** |
| `deaths` | integer | deaths since page load | printed |
| `next` | object or `null` | the next obstacle row ahead of the player, see below. `null` when nothing is within 60 m. **If the property is absent entirely** the gate drives straight, prints one line saying so, and the run fails as "no `next` telemetry" | all steering |
| `heroBox` | `[sx, sy, w, h]` | the player's screen-space bounding box in CSS px | printed as a percentage of the frame height in the caption |

## `next` — the obstacle row the gate steers by

An obstacle **row** is every obstacle whose near edge lies within 2 m of the same z. Rows are what
the gate makes one decision about.

| field | type | semantics |
|---|---|---|
| `next.id` | integer, NEW | unique per row, monotonically increasing as rows are spawned. The gate acts **once per id**; without it a slow poll would swipe twice for one row |
| `next.dist` | metres | from the player's z to the row's near edge, `≥ 0`. The gate decides when this crosses a threshold that is a function of `speed` only, so the decision distance is repeatable between runs |
| `next.len` | metres, NEW | the row's extent along z, near edge to far edge, over every lane in the row (a taxi makes its row ~3 m long even for the crossbar beside it). Default 1 if absent. A roll lasts 0.5 s and must still be active at the far edge, so this decides when the roll starts |
| `next.lanes` | `[k_left, k_mid, k_right]`, NEW | per lane, index `lane + 1`: `null` = free, `'jump'` = can be cleared by a jump (low barrier, cones, scooter…), `'roll'` = can be cleared by a roll (overhead crossbar), `'block'` = cannot be passed (taxi, van, dumpster, divider…). A lane with two things at the same z reports the stricter one (`block > roll > jump`) |
| `next.lane` | `-1\|0\|1` | the obstacle in the player's **current** target lane if there is one, else the one nearest the player's lane |
| `next.kind` | `'jump'\|'roll'\|'block'` | kind of that obstacle |
| `next.type` | string | asset name of that obstacle, for the log (`'low_barrier'`, `'taxi'`…) |

Decisions the gate takes from it, all at distances that scale with speed (constants at the top of
`gate.mjs`). `g` is the gesture allowance: 0.15·speed on phone (a swipe takes ~0.15 s to arrive),
~0 on desktop (a key press is immediate), so the game receives each input at the same distance
either way:

- my lane is `'jump'` → swipe up when `dist ≤ 0.35·speed + 1.5 + g`
- my lane is `'roll'` → swipe down when `dist ≤ max(0.02·speed, (0.5·speed − len)/2 + 0.025·speed) + g`:
  a 0.5 s roll covers `0.5·speed` metres and must span the row from near edge to far edge, so it may
  start only inside a window `0.5·speed − len` wide that ends at the near edge; the gate aims at the
  middle of it. A row longer than `0.5·speed` cannot be rolled under at all: do not build one
- my lane is `'block'` → pick the nearest lane whose entry is `null` (tie: toward the coin lane,
  then toward centre); if none is `null`, the nearest `'jump'`/`'roll'` lane and then do that;
  first swipe when `dist ≤ 0.55·speed + 2.0 + g`, second swipe (two lanes over) as soon as `|x - lane·2| < 0.2`
- my lane is `null` → no obstacle action

## `coin` — opportunistic coin collection (NEW)

| field | type | semantics |
|---|---|---|
| `coin` | object or `null` | the nearest uncollected coin (or coin run) ahead: `{ dist, lane }`. `null` when none within 60 m |
| `coin.dist` | metres | player z to the coin |
| `coin.lane` | `-1\|0\|1` | its lane |

The gate swipes toward `coin.lane` only when: `coin.lane ≠ lane`, `|coin.lane - lane| = 1`,
`coin.dist ≤ 0.65·speed + 2 + g`, no obstacle decision is pending, and either `next` is `null` or
`next.lanes[coin.lane + 1] === null` or `next.dist > coin.dist + 0.8·speed`. Coins are what
asserts `coins > 0`, so a build that spawns coins only in lanes the gate never visits fails.

## Counters (NEW)

| field | type | semantics | assertion |
|---|---|---|---|
| `jumps` | integer | jumps **performed** this run (incremented when a jump actually starts, not when a swipe is received) | **jumps ≥ 1** |
| `rolls` | integer | rolls performed this run | **rolls ≥ 1** |

A swipe that arrives while the player is already airborne or rolling must not increment them.

## URL parameters the gate passes

`?seed=<n>&gate=1` — `seed` fixes the chunk sequence, obstacle rows and coin runs; `gate=1` fixes
the speed ramp to distance (9 m/s, +0.6 every 150 m, cap 20) so the same distance always sees the
same speed. Two runs on an unchanged build with the same seed must produce the same rows at the
same distances; the gate's noise-floor mode (`--runs=N`) measures what is left.

## What each verdict line reads

| verdict line | fields |
|---|---|
| distance ≥ 600 m | `distance` (else `pos[1]`) |
| coins > 0 | `coins` |
| ≥ 1 jump, ≥ 1 roll | `jumps`, `rolls` |
| not dead before 400 m | `over`, `distance` |
| peak draws ≤ 900, peak tris ≤ 1.5M | `draws`, `tris` |
| READY < 20 s, weight < 5 MB (`--4g`) | `__READY__`, response body bytes |
| started from the real control | `#startb`, then `speed > 0` or `distance` increasing within 3 s |
| no 404s, no console errors, no file outside the game folder | the gate's own server and page listeners |
