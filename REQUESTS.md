# Owner's requests — running list (newest batch first)

Everything the owner has asked for, in their words where possible, with status. Update the status
column as work lands; never delete a line.

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
