<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Local web verification, 2026-11-13

The local web radio is implemented against catalogue checkpoint `1070b43`, with subsequent source-test/documentation commits through `a80cc64`. It has 29 stations in 26 languages and 18,894 verified chapter addresses. Source verification records and the generated station register remain the catalogue writer's evidence; the coordinator independently exercised the assembled player.

## Gates

- `bun run check`: zero errors, zero warnings.
- `bun run lint`: Prettier and ESLint clean.
- `bun run test:unit --run`: 124 tests pass in 14 files.
- `bun run test:e2e`: 11 tests pass against the built Cloudflare worker, two workers maximum.
- `bun run build`: production build succeeds without warnings.
- `bun scripts-chirho/generate_radio_sounds_chirho.ts --check`: all nine deterministic WAV files match, 202,812 bytes total.
- Two simultaneous `bun run gen:check` invocations pass after isolating their temporary configuration files.
- Five deliberate violations turn their targeted tests red: obsolete track rejection, obsolete play-attempt rejection, unlimited recovery, replacing the followed passage with a detour, and discarding the recovery checkpoint. Source restored byte for byte; details and hash in `negative_controls_chirho.json`.

The browser suite uses original synthesized fixture audio through the actual decoder. It covers one-tap playback, tuning, remembered settings, natural chapter progression, late JavaScript readiness, a partial-station round trip, a refused network connection followed by successful recovery, dragging the seek thumb while the clock advances, bounded missing-file retries, denied storage, a 320-pixel viewport, catalogue JSON/CORS headers, and every recording's credit.

## Real upstream playback

`live_playback_chirho.json` is the final probe against the frozen built worker at port 4173, with no media interception. The same media element plays all four streams; the other element is the original tuning effect. Every media clock advances, audio is unmuted, and only Scripture audio remains active after loading.

| Recording                                                 | Gesture to browser playing event |
| --------------------------------------------------------- | -------------------------------: |
| English BSB, Barry Hays                                   |                         287.2 ms |
| English BSB, Bob Souer                                    |                          31.1 ms |
| Hindi ULB                                                 |                         141.4 ms |
| Spanish Reina-Valera Antigua, LibriVox / Internet Archive |                       1,414.7 ms |

Navigation to the first playing event in this run: 456.4 ms. The earlier retained sample is `live_playback_initial_chirho.json`. These are single-run browser event measurements, not acoustic latency, time to the first spoken verse, a cold-network guarantee, or physical-device measurements. Recordings can contain spoken headings and introductions. No Scripture audio bytes were saved.

`live_failure_chirho.json` retains an interrupted development-server probe: catalogue hot reload reset the page between sources. The final probe uses the frozen production build. An earlier probe also exposed an enabled server-rendered play control before its handler was ready; controls now wait for initialization, with a delayed-JavaScript regression test.

## Review and repairs

The catalogue writer independently read the controller, preferences, sound controller and screen, then executed the real controller with the real 29-station catalogue and a media stand-in. Its bounded recheck found no blocker in followed-place persistence or recovery rollback. It executed a complete dial turn, detour reopening, repeated offline retries, restored connectivity and paused-load failure.

That review found and led to repairs for passage drift across partial stations, saving unsuccessful recovery attempts, resuming after a paused failure, raw-second clamping after a pre-tap station change, reliance on software volume on iOS, and redundant seeks on untimed targets. Additional browser checks cover actual refused connections and seek dragging. A seek within a detour keeps the followed passage; explicit chapter selection and automatic chapter progression intentionally move it. Two partial stations that land on the same fallback passage currently restart that fallback; preserving its position is future polish.

Sound gain is encoded into the PCM rather than relying on per-element volume. A test measures all nine files below 0.16 full-scale peak. Physical iOS levels, Safari/background behavior, headset controls and native apps are not established by these checks.

## Package and privacy boundary

`build_inventory_chirho.json` inventories the prepared Cloudflare asset directory and the complete local Wrangler dry-run bundle, including its source map. The worker is 572,256 bytes; Wrangler reports 107.06 KiB gzipped. The prepared asset directory contains 27 files and 510,453 bytes, including the loader and header files excluded from asset upload by the generated `.assetsignore`. This is a local packaging check, not an upload.

All 71 configured sensitive credential values checked against those complete outputs had zero byte matches. The package contains exactly nine original WAV effects and no Scripture audio files. Owner words, credentials and unsent outreach are ignored by Git. Outgoing source/history scans are recorded with the local landing.

Three rendered refinement passes are retained under `renders-chirho/`: initial desktop/mobile, smaller mobile controls with larger touch targets, and the final multilingual built-worker view. No external image or sound asset was generated or purchased.

Nothing was pushed, deployed, registered in a store, sent to a provider, or changed in DNS. The source licence, native/wrapped choice, final app identifier and owner-held Bible Brain key remain open. Further library work is recorded in the sources file; it is not part of the currently playable language count.
