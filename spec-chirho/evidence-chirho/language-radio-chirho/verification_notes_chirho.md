<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Web language integration evidence

Measured locally on 2026-11-13, following web landing `ca8490f` and catalogue landing `44e1b47`. Source documentation was then synchronized by its owner in `2198d56`; data and exports were unchanged. Nothing has been uploaded, pushed or deployed.

## What works

The picker merges 29 built-in stations and 431 Davar stations into 460 stations across 400 distinct language tags. Search accepts English names, known native names and language tags. Selecting a language fetches its small station file and limits the dial to the built-in and loaded recordings of that language. The starting 29-station dial remains available. First-run playback requests no language data; this was asserted against the built worker.

The current recording keeps playing while a language loads. A failed load leaves its audio and place intact. The language client caps response bytes while streaming at 128,000 and aborts after eight seconds; unsuccessful HTTP bodies are cancelled. It holds one language index, at most three cached language files and one active selection request. A late result is rejected before cache insertion and ignored by the screen. Direct station selection cancels a pending language choice.

Dynamic preferences carry a bounded station id and language code, never an address or station object. The saved language is fetched and its station id matched before the controller is created. A failed restore, repeated reopen or failed alternate selection writes nothing over the saved place and retains retry and built-in fallback controls. Built-in-only languages restore without requiring the index, treating a missing language file as no extra recordings. Existing followed-passage and network-recovery behavior remains covered.

## Executed gates

- `bun run check`: zero errors and warnings.
- `bun run lint`: Prettier and ESLint clean.
- `bun run test:unit --run`: 161 tests in 18 files pass.
- `bun run test:e2e`: 18 tests pass against the freshly built worker with the real browser decoder and a generated WAV fixture. The build completes without warnings.
- Nine original WAV effects reproduce exactly: 202,812 bytes. No Scripture audio is packaged.
- A deliberate removal of the cancelled-result guard made the targeted test fail: the cancelled promise resolved instead of rejecting. The original source was restored byte for byte and its focused suite passed. The final source hash is in `negative_control_chirho.json`.
- Editable files remain below 1,500 lines; the largest implementation is 785 lines. Framework-generated binding declarations are excluded from this source-size limit.

Three rendered refinement passes are retained at desktop 1280 px, mobile 390 px and narrow 320 px. Pass 1 establishes the integrated picker and full required notice. Pass 2 corrects restore behavior, name pronunciation tags and singular/plural captions. Pass 3 adds direct return and keyboard focus, a shorter language-specific station heading and wrapping for long names. Every captured width equals the document width. The final browser suite additionally checks search focus, return focus and a loaded recording at 320 px.

## Real-source playback

`live_playback_chirho.json` records five actual streams with no media interception and no saved Scripture bytes. English Hays, English Souer, Hindi from Bible in Every Language, Hindi from Davar and Spanish from the Internet Archive all reached playing and their clocks advanced. Only Scripture remained active after loading, unmuted. Gesture-to-playing observations were 187.2, 57.9, 158.2, 469.2 and 1,795.8 ms, respectively; navigation to the first playing event was 338.4 ms. One machine, one run, browser events rather than acoustic or first-verse measurements.

The probe records its tested worker hash. It preceded the final unsuccessful-response body cancellation cleanup; that change leaves the successful path unchanged, and the complete final browser suite was rerun afterwards. Native devices, lock-screen/background behavior and native access to the Davar host are not established by this evidence.

## Package and privacy

The complete local Wrangler dry-run bundle is 593,424 bytes, reported as 109.29 KiB gzipped. The prepared directory is 1,796,515 bytes in 417 files, including 390 catalogue JSON files totaling 1,268,216 bytes. This is 1,286,062 bytes larger than the previous web landing, nearly all of it language data. Browser requests prove these files are absent from the first-sound path.

`build_inventory_chirho.json` retains each prepared and dry-run file's path, byte count and SHA-256, including the local source map. None of 62 configured values selected by credential-key names appeared in those bytes. Gitleaks scans of the prepared directory and complete dry-run package found no leaks. Generated asset exclusions keep the worker and header/routing metadata out of the static asset set. Only the existing nine generated WAVs appear as audio.

Davar's 349,722 chapter addresses are publisher-listed coverage matched to the source's own filenames. The catalogue seat opened the first listed file of all 431 recordings, not every chapter. The web shows this distinction and displays the complete text and audio notices for its selected recording. The 67 unoffered source files, including fourth Joel chapters in 61 recordings, remain catalogue follow-up work.
