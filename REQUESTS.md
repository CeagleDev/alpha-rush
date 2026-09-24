# Owner's requests — running list (newest batch first)

Everything the owner has asked for, in their words where possible, with status. Update the status
column as work lands; never delete a line.

## 2026-09-23/24: Alpha Rush batch

| # | Request | Status |
|---|---|---|
| 9 | Player response too slow; jumps and rolls must be swift (Subway Surfers) | done: 0.9 s hang with a fast-rise/hover arc, slide 0.6 s, lane change 0.14 s, poses snap faster, and a swipe made while a move is impossible is buffered 0.28 s and fires the instant it is legal |
| 10 | Two more environments | done: neon ROOFTOPS (at deck height, laundry lines, tanks, billboards) and the TORII shrine path (gates, lanterns, cedars, mist); cycle is now 40 chunks / 1200 m |
| 11 | UI like a proper racing game, unique, mobile-first; rename to ALPHA RUSH | done: cyan/magenta/amber racing front end, racing HUD with km/h, chamfered panels |
| 12 | Pause button, Esc to pause, typical pause controls | done: pause button, Esc/P, tap outside; RESUME / RESTART / SOUND / HOME |
| 13 | Load onto a character-select screen with three unique story characters (not modern runners) | done: KAITO the Last Ronin, YUZU the Shrine Courier, RAIDEN the Neon Oni; Atlas references approved by the owner, modelled in code |
| 14 | Tabs at the bottom: achievements, players, missions, tasks, power-ups | done: five tabs; daily tasks pay coins to a bank, power-ups upgrade with coins, twelve achievements |
| 15 | (found by the jam gate) first row could be a cart in the centre lane at 18 m | fixed: the first 90 m keep the centre lane clear |

## 2026-09-21, later

| # | Request | Status |
|---|---|---|
| 8 | On the bridge, the slide-under barricade takes up two lanes. | fixed: it was planted on the lane line, half across two lanes; now one lane, centred |

## Batch 2026-09-21 (after the rules pass)

| # | Request | Status |
|---|---|---|
| 1 | **Top priority.** Subway Surfers is the base reference: review how it is built (runner interactions, rules) and adapt our build to it. | done for this pass: power-ups (magnet, charm shield, x2, super sneakers), score x multiplier, missions in sets of three that raise the multiplier for good, saved best; earlier: guard rule, crash vs stumble, move cancels. Not yet: running on top of vehicles, moving traffic, a flight section |
| 2 | Expand the scenes. We only have two (street, highway). Add one run scene that **transitions to daytime**, then goes back into the **night Korean-style street**. | done: dawn on the expressway, a daylight morning-market street (6 chunks), golden dusk into the night market. 780 m cycle. No sun shadow pass yet. An Atlas cloud sky is generated and waits for sign-off (?daysky=1) |
| 3 | It is an endless runner: keep it as **engaging as possible until the runner fails**. | in progress: pickups, missions, multiplier, best score, new scene in; see 'not yet' in #1 |
| 4 | Make the **gold coins more yellow** so the TAO logo on the coin shows. | done: yellow gold, dark recessed field, the tau reads |
| 5 | There is an **unusual glow on the runner**. He must look naturally lit by whatever location he is in. | done: hero albedo scaled into the street's range + per-lamp cap on light landing on him; he is lit only by the location's own lights |
| 6 | The runner is **too tall**. Reduce his height a little, like other runner games. | done: 1.72 m to 1.56 m, camera holds him at 25 % of the frame (was 29 %) |
| 7 | His body is **not well built, he looks like a wooden sculpture**. Bring him to a better level of realism. | done: rebuilt from three candidates (picked C): organic cloth volumes, no boxes. Face and hands are still simple up close |

## Earlier batch 2026-09-21

| # | Request | Status |
|---|---|---|
| a | Runner passed through the expressway "barricades" | fixed (rails were laid across the lanes; commit 14b4eb4) |
| b | Dogs visible only in the first seconds, then again only after a stumble, like Subway Surfers | done (commit aeedd22) |
| c | The slide was too quick | done: 0.5 s to 0.8 s, with jump-cancel |
| d | Research Subway Surfers, Temple Run, Tom Gold Run, Sonic Dash and improve from the findings | rules pass done; see NOTES.md |
