# Brief: Alpha Rush music and sound, pass 2

Owner: "The music in the game doesn't match the runner game. Let the game have a calm music in the selection
page then when the run starts let it change to a more exciting song."

You own game/src/audio.js only (read it fully first: it already synthesises music and ambience with WebAudio,
unlocks on the first tap, has setMuted/setPaused, listens to events). No audio files (jam rule + weight);
everything stays procedural WebAudio. Keep every existing export and event hook working; keep the stamp suffix.

Build:
1. HOME track (plays after the first user gesture on the home screen; main.js emits nothing for that, so start
   it from audio.unlock() when `state.running` is false): calm, 72 bpm, a warm pad (detuned saws through a
   lowpass, slow filter LFO), a soft plucked pentatonic arpeggio in a Japanese-flavoured scale (e.g. in-sen or
   hirajoshi), a gentle sub, occasional wind-chime hits with long reverb (convolver from generated noise).
   Loops seamlessly on a 16-bar pattern. Quiet (-14 dB relative to SFX peaks).
2. RUN track (crossfades in over 0.8 s on 'start'; crossfades back to HOME on 'quit'; ducks to a low pass +
   slow pulse on 'death' then HOME after 2 s): driving, 142 bpm, four-on-the-floor kick, offbeat hats, a
   sidechained saw bass line in the same key, a lead motif every 8 bars, risers every 16 bars, and INTENSITY
   that follows state.speed (9 -> 20 m/s): more hats/percussion layers and a brighter filter as speed rises.
   Zone stingers on 'zone' (a short hit) and a distinct lift on 'reveal'.
3. Pause: the run track lowpasses to a muffled bed while state.paused (setPaused already exists; wire it).
4. SFX (short, synthesised): Alpha pickup (bright blip, pitch rising with streak: read state.streak if set),
   jump, slide, stumble, crash, power-up pickup (a distinct fanfare per type: magnet, omamori, x2, sneakers,
   surge - surge is a big rising whoosh + chord), shield break, mission done, achievement.
5. A master limiter so nothing clips; a mute toggle keeps working.

Verify with a small puppeteer script in work/v2/ (headless Chrome autoplay flags: launch with
`--autoplay-policy=no-user-gesture-required`) that boots the game, taps start, and records 6 s of the
destination's output via an OfflineAudioContext or a ScriptProcessor tap into a Float32 buffer, then reports
peak/RMS per second and that the level changes between home and run. No listening is possible here, so also
write work/v2/AUDIO_NOTES.md describing each layer and its parameters. Laptop on battery: one browser, close it.
Final message: 5 honest lines.
