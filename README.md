<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Audio Bible Radio

The audio Bible in many languages. Turn it on and it plays.

Audio Bible Radio is a free ministry project from Love Jesus Software for the web, iOS including
Apple Watch, and Android. It works like a radio: turn it on and Scripture plays; turn the dial to another language or version. Browsers that allow it can start automatically.

Home: [audiobiblerad.io](https://audiobiblerad.io)

## Status

The web radio offers 460 stations across 400 languages, streamed directly from their source hosts. The original 29 stations remain immediately available; language labels load additional recording data only when needed. It remembers a
station and passage on the device, continues through chapters, shows recording credits, and has
toggleable tuning, click and knob sounds. Verse timings carry the place between timed recordings;
other station changes use the fraction of the chapter. Partial recordings skip to their next
available chapter.

Native apps await the owner's packaging decision. Bible Brain integration awaits the owner's
key and confirmation of the permitted server arrangement.

The web radio went live on 2026-11-14 at [audiobiblerad.io](https://audiobiblerad.io), with HTTPS
and real upstream playback verified. The `www` address also serves the radio. The release record
is in [`spec-chirho/evidence-chirho/web-release-chirho/`](spec-chirho/evidence-chirho/web-release-chirho/deployment_chirho.json).

## Radio controls and skins

The web radio has book and chapter knobs, caption dropdowns, language/version/voice labels and an FM station dial. It has On/Off, a compact About dialog, browser-language selection for a first visit and four remembered models: Minimal, 1980s Digital by a fjord, Field Radio by a forest river and Cyberpunk in a rainy city. The three character radios use GPT Image 2.6 raster artwork. Rain and water rings respect reduced motion and pause in a hidden tab.

Audible autoplay is attempted where the browser permits it. Otherwise a prominent PRESS HERE button points to On. An explicit Off stays off when reopened. Tuning plays once per deliberate tune, without repeating during recovery or between chapters. Presses and knob steps have separate interface feedback; the sound switch silences both channels.

An optional 3D switch on the radio keeps the same live controls and audio while adding a beveled case, raised rotating knobs, lighting and a camera that pivots by dragging. Vertical touch swipes and the mouse wheel still scroll the page. Automatic selection waits for Scripture to start and a quiet moment, then measures the actual scene; reduced motion, data saving, a small display or slow/unavailable graphics keep the lightweight view. Graphics failure returns to that view without replacing playback. Only the view choice is remembered. The graphics module loads on demand, and Watch retains the lightweight model.

The owner's short, purchased Splice effects are prepared locally for app use and excluded from public Git. A clone uses eleven deterministic CC0 sounds: nine tuning cues plus click and knob feedback. No Splice sample or right to reuse one is supplied with this repository. See the separate sound notices below.

The four-model interface and outside-site widget were published on 2026-11-14. The current release and its verification are recorded in [`spec-chirho/evidence-chirho/widget-release-chirho/`](spec-chirho/evidence-chirho/widget-release-chirho/deployment_chirho.json); the first release evidence above is retained.
The optional 3D and purchased-effects upgrade was published on 2026-11-15. Reload the radio and use the 3D switch beside Sound to choose it explicitly. A sound follow-up now gives slow-starting interface clips more time and permits a deliberate retry after a media error. The current release and public Chromium/WebKit event checks are in [`spec-chirho/evidence-chirho/sound-deadline-chirho/`](spec-chirho/evidence-chirho/sound-deadline-chirho/deployment_chirho.json). Earlier release records and failed checks remain retained; physical-device and acoustic verification remain separate work.

## Embed the radio

Choose a model and starting language, preview it and copy the iframe at [the widget setup page](https://audiobiblerad.io/widget-chirho). The compact player is at [the embed endpoint](https://audiobiblerad.io/embed-chirho). It explicitly permits outside framing and retains the selected recording's visible copyright and licence notices.

Give an embedding AI agent [the plain integration guide](https://audiobiblerad.io/llms.txt). It includes the exact snippet, URL options, parent-site CSP and autoplay settings, storage behavior, verification steps and recording terms. Access must stay free; Davar recordings are non-commercial only.

## Where the audio comes from

The apps stream recordings from their publishers' own hosts and do not copy them. Each source has
its own licence, recorded in
[`spec-chirho/sources-chirho/`](spec-chirho/sources-chirho/26-11-13-public-audio-sources-chirho.md).

## Running it

```bash
bun install --frozen-lockfile
bun run dev
```

Checks:

```bash
bun run check
bun run lint
bun run test:unit --run
bun run test:e2e
bun run build
bun scripts-chirho/generate_radio_sounds_chirho.ts --check
bun scripts-chirho/sounds-chirho/generate_interface_sounds_chirho.ts --check-chirho
```

The unit tests exercise playback, cancellation, position, preference validation and bounded failure
recovery. Browser tests use a generated WAV fixture through the real media decoder; they do not
download Scripture. The optional `bun scripts-chirho/verify_live_playback_chirho.ts` probe streams
four real chapters briefly (five with `--languages-chirho`) from their publishers, against a running local preview (default port
5196; override `RADIO_PREVIEW_URL_CHIRHO`). It records browser event timings, not physical audio
latency, in `spec-chirho/evidence-chirho/web-radio-chirho/` and saves no Scripture audio. Use `--experience-chirho` for local new-interface evidence or `--production-chirho --widget-chirho` for the current published release without overwriting the first release's evidence. `bun scripts-chirho/release-chirho/verify_widget_playback_chirho.ts` checks actual source playback inside a controlled second-origin HTTPS parent. Browser tests use their own preview port, 4186 by default (`PLAYWRIGHT_PORT_CHIRHO` can override it).

Built-in recording credits are at `/credits-chirho`; each selected station also shows its complete credit inside the radio. Davar chapter coverage follows its publisher file lists; the first file of every recording was opened, rather than every chapter. `/catalogue-chirho` serves the same JSON-safe, cleared
built-in catalogue used by the web player. The language index and per-language files live under `/catalogue-chirho/` assets. Davar native-client access is unresolved. No provider key belongs in that data.

## License

The code is free software under the GNU General Public License, version 3 or later, with an
added permission for distribution through app stores. The radio's eleven synthesised sounds are dedicated
to the public domain under CC0 1.0; purchased Splice effects are excluded from this repository and dedication. Scripture recordings are covered by neither: none is in this
repository, and each stays under its publisher's own terms, some of which forbid commercial use.
See [`LICENSE`](LICENSE) and [`LICENSES-chirho/README-chirho.md`](LICENSES-chirho/README-chirho.md).

## For contributors and agents

Project rules are in [`AGENTS.md`](AGENTS.md). The design proposal is in
[`spec-chirho/design-chirho/`](spec-chirho/design-chirho/26-11-13-proposed-design-chirho.md).
