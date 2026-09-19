# tools/ — the midnight-dash gate

`node tools/gate.mjs game/` drives the game with real input (CDP touch swipes on a 390x844 @3x phone viewport, real keys on desktop), steers by `__GAME__.next`, photographs it at 60/150/300/450/600/800 m into `game/_gate/filmstrip.png`, prints a verdict block and exits non-zero naming the first failure. Every field it reads is in `GATE_CONTRACT.md`.

- `--phone` (default) / `--desktop` — phone is the measurement run (portrait, same shape as the bar); desktop is 1280x720 with arrow keys.
- `--seed=7` — passed as `?seed=N&gate=1` so the run is repeatable. `--out=<dir>` — where frames, `strip.html`, `decisions.log`, `verdict.json` go (default `<game>/_gate`).
- `--runs=N` — repeat, `run2/`… beside the first, then print median and spread of mean luma per frame index: the noise floor any claim must beat.
- `--4g` — 4 Mbps / 1 Mbps / 60 ms, CPU 2x; gates READY < 20 s and weight < 5 MB (reported but not judged without it).
- `--clip` — screencast to `<out>/clip/*.jpg` and, with `~/.local/bin/ffmpeg`, `<out>/clip.mp4` at 24 fps with `#hud` hidden.
- `--frames=N` — N photo distances spread 60..800 m; `--at=60,150,...` sets them exactly.
- `fixtures/fake-runner/` is a canvas stand-in that implements the whole contract; `node tools/gate.mjs tools/fixtures/fake-runner` must PASS, and the floor build must fail with "no __GAME__.next".
