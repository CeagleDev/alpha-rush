# Alpha Rush audio, pass 2 — what is in game/src/audio.js

Everything is procedural WebAudio (no files). Key: D. HOME uses the in-sen scale (D Eb G A C); RUN's bass uses
D minor pentatonic (D F G A C) and its lead motif uses in-sen, so the two tracks share a tonal centre and the
crossfades do not clash. D4 = 293.66 Hz; every pitch is written as semitones from D4.

## Graph

```
sfx (0 dB) ─────────────────────────────────────────────────┐
HOME: voices → homeMix ─┬─────────────────────→ homeG (-14 dB, crossfade) ─┐
                        └→ revSend → convolver → revRet (0.55) ┘            │
RUN:  drums/lead → runMix ─┐                                                 ├→ world → pauseLP → master (0.9) → limiter → out
      bass/stabs → scGain ─┘→ runTone (LP, intensity) → pulseG (death LFO) → runG (-6 dB, crossfade) ┤
ambience: ambA (alley) + ambX (expressway) → amb (-9 dB) ───────────────────┘
```

- limiter: DynamicsCompressor threshold -6 dB, knee 3, ratio 20:1, attack 1 ms, release 90 ms. Probe peak -0.8 dBFS with
  a crash SFX on top of the run track: nothing clips.
- mute: `setMuted` → master gain 0 (20 ms). `isMuted` unchanged.
- pause: `setPaused(true)` → pauseLP 20 kHz → 360 Hz (tau 120 ms), world gain 0.7. Music and ambience keep playing under
  the filter (the sequencer is on a 60 ms `setInterval`, so main.js skipping `update()` while paused does not starve it).
  A hidden tab suspends the context instead (main.js pauses on `visibilitychange`); resume on unpause / visible.
- reverb IR: 2.8 s stereo generated noise, exponential decay (tail constant 2.2 s), progressively lowpassed along the
  tail, 200-sample fade-in.

## HOME track — 72 bpm, 8th-note steps, 16 bars = 128 steps (53.3 s loop)

Starts from the first gesture on the home screen (pointerdown / touchend / keydown captured on `document`, once) via
`unlock()` when `state.running` is false; also from `unlock()` inside the start tap; returns on 'quit' and 2 s after
'death'. Bus -14 dB, 0.8 s linear fade.

| layer | sound | parameters |
| --- | --- | --- |
| pad | 3 detuned saws per note (-9 / 0 / +9 cents) + a triangle an octave under the lowest note | lowpass 520 Hz, Q 0.9, LFO 0.06 Hz ± 230 Hz on cutoff; envelope attack 1.8 s, hold, release 2.6 s; gain 0.055; reverb send 0.03 |
| pad chords | 4 bars each: D3 A3 D4 G4 → C3 G3 D4 A4 → G2 D3 G3 C4 → A2 D3 G3 C4 | scheduled on bars 1, 5, 9, 13; releases overlap the next chord so the loop point is seamless |
| sub | sine on the chord root: D2 (73.4) → C2 (65.4) → G1 (49) → A1 (55) | attack 0.6 s, release 0.9 s, gain 0.32 |
| pluck (koto-ish) | triangle + sine an octave up (0.25) through lowpass 2.3 kHz, 12 ms noise click | attack 4 ms, decay 0.55 s; gain 0.2 × velocity; reverb send 0.13 × velocity; pan ±0.4 |
| arpeggio pattern | composed once from a fixed seed (mulberry32(7)) over a 2-octave in-sen ladder D4…D6, stepwise motion (±2 degrees), 36 % density (55 % in bars 4-7 of each 8-bar phrase), 12 % grace notes a 4th above half a step later | identical every loop |
| wind chimes | 4 inharmonic partials (1, 2.76, 5.4, 8.93 × f; decays 2.4 / 1.7 / 1.1 / 0.7 s) on in-sen notes D6…C7 | 1-3 chimes 60-120 ms apart, ~30 % of bars plus the loop downbeat; dry 0.45, reverb send 1.0 |

## RUN track — 142 bpm, 16th-note steps, 16 bars = 256 steps (27 s loop)

Crossfades in over 0.8 s on 'start' (bus -6 dB), out on 'quit'. INTENSITY `I` = clamp((speed − 9) / (20 − 9), 0, 1),
smoothed with `inten += (target − inten) · min(1, 2·dt)`; read at schedule time per hit and mapped to
`runTone` cutoff = 1800 + 14000·I Hz (updated every 100 ms). Per-bar root (semitones): D ×8 bars, F ×4, C ×2, A ×2.

| layer | when | sound |
| --- | --- | --- |
| kick | every beat (steps 0/4/8/12); extra ghost on step 14 of every 4th bar when I > 0.7 | sine 165 → 42 Hz over 160 ms, 260 ms decay, gain 0.9; 20 ms highpassed click 0.22 |
| sidechain | on every kick | `scGain` 0.1 → 1 linear over 200 ms (bass + stabs pump) |
| closed hats | offbeat 8ths (steps 2/6/10/14) always; every odd 16th when I > 0.35 | highpass 8 kHz noise, 45 ms; 0.28 + 0.12·I (offbeats), 0.06 + 0.16·I (16ths); panned ±0.15 |
| open hat | step 14 when I > 0.5 | highpass 6.5 kHz, 320 ms, 0.10 + 0.14·I |
| clap | backbeat (steps 4/12) | 3 bandpass bursts 11 ms apart + 160 ms tail at 1.3-1.5 kHz; 0.32 + 0.22·I |
| rim | steps 3/10/13 when I > 0.6 | triangle 900 → 480 Hz 30 ms + bandpass 2.6 kHz tick; 0.10 + 0.12·I |
| shaker | odd 16ths when I > 0.8 | bandpass 6.5 kHz Q 2, 45 ms; 0.05 + 0.10·I |
| bass | every 8th; 2-bar figure [0 0 12 0 0 7 10 0 / 0 0 12 0 0 3 5 7] semitones over the bar root, D2 base | two saws (0 / +9 cents), lowpass 420 + 2600·I Hz Q 4, decay 1.8 steps; gain 0.5 → scGain |
| chord stabs | steps 2 and 10 (offbeat) | saws root−12 / −5 / 0 / +5, lowpass 900 + 3200·I, 170 ms; 0.15 → scGain |
| lead motif | bars 7-8 and 15-16 (every 8 bars), 8th notes: 7 10 12 10 7 5 · 0 / 1 0 · 7 5 · 0 · (in-sen from D5, + bar root) | saws ±7 cents + square an octave down (0.3), lowpass 1500 + 4000·I; 260 ms; gain 0.2 into a dotted-8th delay (317 ms, feedback 0.35, lowpass 2.6 kHz, return 0.45) |
| riser | bars 15-16 (every 16 bars, 3.4 s) | bandpass noise 350 → 6500 Hz Q 1.6, gain 0.02 → 0.38; saw D2 → D3 through lowpass 800 → 4500 Hz, 0.03 → 0.16 |
| crash | step 0 of every loop after the first | highpass noise 3.2 kHz → 1 kHz, 1.2 s, 0.36 |

- 'death': runTone → 260 Hz (tau 250 ms), pulseG 0.5 with a 1.7 Hz LFO of depth 0.42 (the slow pulse), runG → −12 dB
  over 0.5 s, then after 2 s HOME crossfades back over 1.4 s and the run sequencer stops. 'start' cancels all of it
  (restart from the death card), resets the tone filter and pulse.
- 'zone' while running: ambience crossfade (unchanged) + a stinger on the SFX bus (bandpass noise 1.2 kHz → 200 Hz,
  sine tom 190 → 60 Hz, D3/A3/D4 saw stab through lowpass 1.4 kHz, 300 ms).
- 'reveal': a lift: 8-note rising in-sen arpeggio (60 ms apart, triangle, alternating pan), a saw chord D3 A3 D4 G4 D5
  whose lowpass opens 300 → 5000 Hz over 0.9 s, a noise sweep 500 → 7000 Hz, and a D6 bell tail.

## Ambience (unchanged in character)

Alley: lowpassed (520 Hz) pink noise with a 0.09 Hz swell + 100 Hz saw hum under 220 Hz; drips (sine 2.6-4 kHz → 1.8 kHz,
80 ms) every 1.2-3.8 s in alleyA / alleyB / day. Expressway: bandpass 300 Hz Q 0.5 noise with a 0.21 Hz ± 180 Hz wobble.
Crossfade 1.5 s on 'zone' (expressway / rampUp / rooftops = open air). Fades out over 0.8 s on 'quit'; drops to 0.35 on
'death'.

## SFX (sfx bus, 0 dB; peaks 0.2-0.9 pre-master)

| event | sound |
| --- | --- |
| coin (Alpha pickup) | sine blip + 5th + octave triangle, 80/140 ms; base 880 Hz climbing a major-pentatonic ladder with the streak (`state.streak` if the game sets it, else a local count that resets on hit / stumble / death / 2.5 s idle), capped at 14 steps (≈ 5.9 kHz) |
| jump | bandpass noise 380 → 2400 Hz 280 ms + triangle 220 → 520 Hz + sine 440 → 880 Hz |
| slide ('roll') | lowpass noise 900 → 160 Hz 340 ms + bandpass scrape + sine 120 → 45 Hz |
| stumble | soft hit (noise + sine 150 → 50 Hz) + a 14 Hz wobbled triangle 330 → 240 Hz |
| hit (non-fatal) | the pass-1 hit: highpass + bandpass noise and a sine 160 → 38 Hz |
| crash ('death'; a fatal 'hit' is silent because 'death' follows) | big noise burst 900 → 200 Hz, sine 140 → 30 Hz at 0.9, and a falling dissonant saw smear (D2 / A2 / Eb2 → an octave down) through 700 Hz |
| power-up: magnet | filtered saw zip 160 → 1400 Hz (bandpass 400 → 3200 Hz Q 4) + two square pings A5 / D6 |
| power-up: omamori | shrine bell: partials 1 / 2.02 / 2.98 / 4.9 × 1046 Hz decaying 1.4 … 0.5 s, then D5 and A5 sines |
| power-up: x2 | D5, G5 quick (100 ms each), then a saw octave stab D6 / D5 / A5 with a triangle D6 |
| power-up: sneakers | three rising triangle boings (0.8× → 1.4× pitch, 110 ms apart, panned L→R) + a noise flick |
| power-up: surge | 1.1 s bandpass whoosh 220 → 7500 Hz + saw D2 → D4 glide, then a 10-saw chord D3 A3 D4 G4 D5 (±9 cents) whose lowpass opens 600 → 6000 Hz, a highpass splash and a D6 triangle |
| shield break | glassy bandpass burst 6.5 → 2.5 kHz, five falling sine shards 2.2-5.4 kHz panned, low thump 170 → 50 Hz |
| mission done | triangle D5 G5 A5 D6 (120 ms apart) + a D6 sine tail |
| achievement | triangle + detuned saw D5 A5 D6 A6 (100 ms apart), a held saw chord D4-D6 (lowpass 2.2 kHz) and a 6-note in-sen shimmer above |
| lane change ('input' left/right) | bandpass whoosh, panned ±0.4 (unchanged) |
| bark | the pass-1 formant bark, panned by lane (unchanged) |

## Verification (work/v2/audio_probe.mjs, headless Chrome, `--autoplay-policy=no-user-gesture-required`)

A ScriptProcessor tap on every node connected to `ac.destination`, per-second peak / RMS / zero-crossing rate:
HOME −23.5 dB RMS (peak −15.6), RUN −18.5 dB RMS (peak −1.7, brightness ×4.5), PAUSE −3.6 dB below RUN with brightness
×0.44 (muffled), HOME after quit −24 dB, DEATH duck −28.7 dB, overall peak −0.8 dBFS (no clipping). RUN intensity
stayed near 0 in the probe (the runner accelerates from 0 and is under 9 m/s for the first seconds), so the I > 0.35
layers were exercised by code only, not measured.
