# Alpha Rush audio, pass 3 — what is in game/src/audio.js

Pass 3 replaces the two synthesised MUSIC tracks with real files (Atlas, encoded to `game/audio/music_home.mp3` and
`game/audio/music_run.mp3`, 96 kbps 44.1 kHz stereo). The pass-2 synth tracks stay in the module as the fallback for a
file that fails to fetch or decode. Every SFX, the ambience, the buses, the export surface (`init`, `unlock`,
`update`, `setMuted`, `isMuted`, `setPaused`) and every event hook are unchanged from pass 2.

## Graph

```
sfx (0 dB) ────────────────────────────────────────────────────────────────────┐
HOME: file → homeFile (trim +13 dB) ──────────────────────┐                     │
      synth voices → homeMix ─┬──────────────→ homeSyn ────┴→ homeG (-14 dB, crossfade) ┐
                              └→ revSend → convolver → revRet ┘                          │
RUN:  file → runShelf (highshelf 3 kHz, 0…+3 dB) → runFile (trim +2 dB, ×1…+1.5 dB) ─┐   ├→ world → pauseLP → master (0.9) → limiter → out
      synth drums/lead → runMix ─┐                                                   │   │
      synth bass/stabs → scGain ─┘→ runSyn ──────────────────────────────────────────┴→ runTone (LP) → pulseG (death LFO) → runG (-6 dB, crossfade) ┤
ambience: ambA (alley) + ambX (expressway) → amb (-9 dB) ─────────────────────────────┘
```

- limiter: DynamicsCompressor threshold -6 dB, knee 3, ratio 20:1, attack 1 ms, release 90 ms.
- mute: `setMuted` → master gain 0 (20 ms). `isMuted` unchanged.
- pause: `setPaused(true)` → pauseLP 20 kHz → 360 Hz (tau 120 ms), world gain 0.7; music (file or synth) and ambience
  keep playing under the filter. A hidden tab suspends the context instead; resume on unpause / visible.
- runTone: still the pass-2 intensity lowpass for the synth (1800 + 14000·I Hz) and the 'death' duck (→ 260 Hz) for
  both voices. While the file voice is playing it sits at 20 kHz (open); the file's brightness comes from runShelf.

## Music files

| | home | run |
| --- | --- | --- |
| file | `audio/music_home.mp3`, 272 KB, 23.14 s decoded | `audio/music_run.mp3`, 752 KB, 63.91 s decoded |
| whole-file level (ffmpeg astats) | RMS -21.1 dBFS, peak -0.7 | RMS -16.9 dBFS, peak +0.1 |
| silence in the encode | 0.28 s leading (plus a 6 ms encoder blip at 0), ~0.9 s trailing | none leading, ~0.6 s trailing |
| loop points (`trimLoop`) | 0.325 … 21.037 s (20.7 s loop) | 0.023 … 63.181 s (63.2 s loop) |
| voice trim into the bus | +13 dB (→ -14 dB bus) | +2 dB (→ -6 dB bus) |

- Loading: `init()` starts both `fetch()`es (URL relative to the module, with the `?v=` stamp); nothing awaits them and
  READY does not wait. Decoding happens as soon as the bytes land: on the real context if it exists, otherwise on a
  throwaway `OfflineAudioContext(2, 1, 44100)` (needs no gesture), otherwise it is deferred to `unlock()`. A failed
  fetch / decode marks the track `failed` (one `console.warn` starting with `audio:`) and that track plays its synth.
- Loop: one `AudioBufferSourceNode` per play, `loop = true`, `loopStart` / `loopEnd` from `trimLoop`: the first of two
  consecutive 1024-sample windows with RMS ≥ -48 dBFS (a lone window is the encoder's start blip) and the last window
  ≥ -48 dBFS. A 6 ms linear fade is written into the decoded buffer in place at both ends so the seam lands on zero.
  The source starts at `loopStart`. Each source has a private gain that fades out on stop, so a track restarted while
  its previous voice is still fading (death card → start) never doubles beyond the fade tail.
- Voice choice (`trackOn`): the file if it is decoded, else the synth sequencer. A file that decodes while its synth is
  playing (`fileArrived`) takes over with a 0.8 s crossfade (synth voice gain → 0, file gain 0 → trim) and the synth
  stops 1 s later; a file that lands while the track is off is simply used next time.
- Crossfade rules are the pass-2 ones, on the bus gains: 'start' HOME → RUN over 0.8 s; 'quit' RUN → HOME over 0.8 s;
  'death' runTone → 260 Hz, pulseG 0.5 with the 1.7 Hz LFO, runG → -12 dB, then HOME returns over 1.4 s after 2 s and
  the run voice stops; paused → the world lowpass; mute → master.
- RUN intensity on the file: `I` = clamp((speed − SPEED0) / (SPEED_MAX − SPEED0), 0, 1) smoothed as before; every
  100 ms runShelf gain = 3·I dB (highshelf, 3 kHz) and runFile gain = trim × 10^(1.5·I / 20). Nothing else: the
  file is fixed. The synth fallback keeps its layered intensity (16th hats, open hat, rim, shaker, tone lowpass).

## Synth fallback (pass 2, unchanged)

Everything below is exactly the pass-2 design and only plays when a file is unavailable. Key: D. HOME uses the in-sen
scale (D Eb G A C); RUN's bass uses D minor pentatonic (D F G A C), its lead motif in-sen. D4 = 293.66 Hz; every pitch
is written as semitones from D4.

### HOME — 72 bpm, 8th-note steps, 16 bars = 128 steps (53.3 s loop)

| layer | sound | parameters |
| --- | --- | --- |
| pad | 3 detuned saws per note (-9 / 0 / +9 cents) + a triangle an octave under the lowest note | lowpass 520 Hz, Q 0.9, LFO 0.06 Hz ± 230 Hz on cutoff; envelope attack 1.8 s, hold, release 2.6 s; gain 0.055; reverb send 0.03 |
| pad chords | 4 bars each: D3 A3 D4 G4 → C3 G3 D4 A4 → G2 D3 G3 C4 → A2 D3 G3 C4 | scheduled on bars 1, 5, 9, 13; releases overlap the next chord |
| sub | sine on the chord root: D2 → C2 → G1 → A1 | attack 0.6 s, release 0.9 s, gain 0.32 |
| pluck | triangle + sine an octave up (0.25) through lowpass 2.3 kHz, 12 ms noise click | attack 4 ms, decay 0.55 s; gain 0.2 × velocity; reverb send 0.13 × velocity; pan ±0.4 |
| arpeggio | composed once from mulberry32(7) over a 2-octave in-sen ladder D4…D6, stepwise, 36 % density (55 % in bars 4-7 of each phrase), 12 % grace notes | identical every loop |
| wind chimes | 4 inharmonic partials (1, 2.76, 5.4, 8.93 × f) on in-sen notes D6…C7 | 1-3 chimes 60-120 ms apart, ~30 % of bars plus the loop downbeat; dry 0.45, reverb send 1.0 |

Reverb IR: 2.8 s stereo generated noise, exponential decay (tail 2.2 s), progressively lowpassed, 200-sample fade-in.

### RUN — 142 bpm, 16th-note steps, 16 bars = 256 steps (27 s loop)

Per-bar root (semitones): D ×8 bars, F ×4, C ×2, A ×2. `I` read at schedule time per hit; runTone = 1800 + 14000·I Hz.

| layer | when | sound |
| --- | --- | --- |
| kick | every beat; ghost on step 14 of every 4th bar when I > 0.7 | sine 165 → 42 Hz, 260 ms, gain 0.9; 20 ms click 0.22; sidechain scGain 0.1 → 1 over 200 ms |
| closed hats | offbeat 8ths always; every odd 16th when I > 0.35 | highpass 8 kHz noise, 45 ms; 0.28 + 0.12·I / 0.06 + 0.16·I; pan ±0.15 |
| open hat | step 14 when I > 0.5 | highpass 6.5 kHz, 320 ms, 0.10 + 0.14·I |
| clap | backbeat | 3 bandpass bursts 11 ms apart + 160 ms tail; 0.32 + 0.22·I |
| rim / shaker | steps 3/10/13 when I > 0.6 / odd 16ths when I > 0.8 | triangle tick + bandpass 2.6 kHz / bandpass 6.5 kHz Q 2 |
| bass | every 8th; 2-bar figure [0 0 12 0 0 7 10 0 / 0 0 12 0 0 3 5 7] over the root, D2 base | two saws (0 / +9 cents), lowpass 420 + 2600·I Hz Q 4; 0.5 → scGain |
| chord stabs | steps 2 and 10 | saws root−12 / −5 / 0 / +5, lowpass 900 + 3200·I, 170 ms; 0.15 → scGain |
| lead motif | bars 7-8 and 15-16 | saws ±7 cents + square an octave down, lowpass 1500 + 4000·I; dotted-8th delay (317 ms, fb 0.35) |
| riser / crash | bars 15-16 / step 0 of every loop after the first | bandpass noise sweep + saw D2 → D3 / highpass noise 3.2 → 1 kHz, 1.2 s |

## Ambience (unchanged)

Alley: lowpassed (520 Hz) pink noise with a 0.09 Hz swell + 100 Hz saw hum under 220 Hz; drips (sine 2.6-4 kHz →
1.8 kHz, 80 ms) every 1.2-3.8 s in alleyA / alleyB / day. Expressway: bandpass 300 Hz Q 0.5 noise with a 0.21 Hz
± 180 Hz wobble. Crossfade 1.5 s on 'zone'. Fades out over 0.8 s on 'quit'; drops to 0.35 on 'death'.

## SFX (sfx bus, 0 dB; unchanged)

| event | sound |
| --- | --- |
| coin (Alpha pickup) | sine blip + 5th + octave triangle; base 880 Hz climbing a major-pentatonic ladder with the streak (`state.streak` or a local count), capped at 14 steps |
| jump | bandpass noise 380 → 2400 Hz 280 ms + triangle 220 → 520 Hz + sine 440 → 880 Hz |
| slide ('roll') | lowpass noise 900 → 160 Hz 340 ms + bandpass scrape + sine 120 → 45 Hz |
| stumble | soft hit + a 14 Hz wobbled triangle 330 → 240 Hz |
| hit (non-fatal) | highpass + bandpass noise and a sine 160 → 38 Hz |
| crash ('death') | noise burst 900 → 200 Hz, sine 140 → 30 Hz at 0.9, falling dissonant saw smear through 700 Hz |
| power-up: magnet / omamori / x2 / sneakers / surge | saw zip + square pings / shrine bell partials / ta-da-DA octave stab / three rising boings / 1.1 s whoosh into a 10-saw chord whose lowpass opens 600 → 6000 Hz |
| shield break | glassy bandpass burst 6.5 → 2.5 kHz, five falling sine shards, low thump 170 → 50 Hz |
| mission / achievement / reveal / zone stinger | triangle D5 G5 A5 D6 / D5 A5 D6 A6 + held saw chord + in-sen shimmer / rising in-sen arpeggio + opening saw chord + noise sweep + D6 bell / bandpass noise + sine tom + D3/A3/D4 stab |
| lane change ('input' left/right) | bandpass whoosh, panned ±0.4 |
| bark | formant bark, panned by lane |

## Verification (work/v2/audio_probe.mjs, one headless Chrome, `--autoplay-policy=no-user-gesture-required`)

The probe taps every node connected to `ac.destination` through a ScriptProcessor (per-second peak / RMS / zero
-crossing brightness) and, since pass 3, logs every looping buffer source longer than 5 s (the file voices) and the
mp3 responses. One run, measured with the first trims (home +10 dB, run +3 dB):

- both files fetched `200 audio/mpeg` (`music_home.mp3?v=…`, `music_run.mp3?v=…`); no page errors, no `audio:`
  warnings (the only console line is Chrome's ScriptProcessor deprecation notice from the probe's own tap).
- file voices: home source started at t = 0.11 s (first tap on the home screen, before start); run source at 6.13 s
  (right after 'start'); home again at 15.76 s (quit) and 22.28 s (2 s after 'death'); run again at 18.77 s (restart).
  Decoded buffers 23.139 s / 63.913 s, 44.1 kHz stereo.
- levels at the output: HOME -29.3 dB RMS (peak -13.5), RUN -16.8 dB RMS (peak -2.2), PAUSE -32.2 dB RMS with
  brightness ×0.22 (muffled), HOME after quit -30.7 dB, DEATH duck -31.2 dB, overall peak -1.2 dBFS (no clipping).
  RUN vs HOME +12.5 dB, brightness ×1.84.
- after that run the trims were set to home +13 dB / run +2 dB (the home intro is ~4 dB under the file's average, the
  run opening ~3 dB over) — by arithmetic on the measured run that is HOME ≈ -26 dB RMS, RUN ≈ -18 dB RMS / peak
  ≈ -3 dBFS, with the +1.5 dB top-speed lift still under the limiter's threshold. The battery did not allow a second
  browser run; the trims are gain constants, the loop points were re-checked offline on ffmpeg-decoded PCM with the
  same `trimLoop` code (home 0.325 … 21.037 s, run 0.023 … 63.181 s, seam samples -44 / -53 dB before the 6 ms fade).
- RUN intensity stayed near 0 in the probe (the runner accelerates from 0 and is under SPEED0 for the first seconds),
  so the shelf / +1.5 dB lift were exercised by code only, not measured.
- weight: `du -sh game` = 22 MB, of which `game/_gate` (QA filmstrips / verdict output) is 16 MB; without it the game
  is 5.3 MB (audio 1.0 MB, textures 2.3 MB, assets 1.4 MB, src 492 KB).
