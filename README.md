<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Audio Bible Radio

The audio Bible in many languages. Turn it on and it plays.

Audio Bible Radio is a free ministry project from Love Jesus Software for the web, iOS including
Apple Watch, and Android. It works like a radio: tap once on the web and Scripture plays; turn the
dial and it plays in another language or version.

Home: [audiobiblerad.io](https://audiobiblerad.io)

## Status

The web radio offers 460 stations across 400 languages, streamed directly from their source hosts. The original 29 stations remain immediately available; language search loads additional recording data only when needed. It remembers a
station and passage on the device, continues through chapters, shows recording credits, and has
nine original, toggleable tuning sounds. Verse timings carry the place between timed recordings;
other station changes use the fraction of the chapter. Partial recordings skip to their next
available chapter.

Native apps await the owner's packaging decision. Bible Brain integration awaits the owner's
key and confirmation of the permitted server arrangement.

The web radio went live on 2026-11-14 at [audiobiblerad.io](https://audiobiblerad.io), with HTTPS
and real upstream playback verified. The `www` address also serves the radio. The release record
is in [`spec-chirho/evidence-chirho/web-release-chirho/`](spec-chirho/evidence-chirho/web-release-chirho/deployment_chirho.json).

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
```

The unit tests exercise playback, cancellation, position, preference validation and bounded failure
recovery. Browser tests use a generated WAV fixture through the real media decoder; they do not
download Scripture. The optional `bun scripts-chirho/verify_live_playback_chirho.ts` probe streams
four real chapters briefly from their publishers, against a running local preview (default port
5196; override `RADIO_PREVIEW_URL_CHIRHO`). It records browser event timings, not physical audio
latency, in `spec-chirho/evidence-chirho/web-radio-chirho/` and saves no Scripture audio.

Built-in recording credits are at `/credits-chirho`; each selected station also shows its complete credit below the radio. Davar chapter coverage follows its publisher file lists; the first file of every recording was opened, rather than every chapter. `/catalogue-chirho` serves the same JSON-safe, cleared
built-in catalogue used by the web player. The language index and per-language files live under `/catalogue-chirho/` assets. Davar native-client access is unresolved. No provider key belongs in that data.

## License

The code is free software under the GNU General Public License, version 3 or later, with an
added permission for distribution through app stores. The radio's own tuning sounds are dedicated
to the public domain under CC0 1.0. Scripture recordings are covered by neither: none is in this
repository, and each stays under its publisher's own terms, some of which forbid commercial use.
See [`LICENSE`](LICENSE) and [`LICENSES-chirho/README-chirho.md`](LICENSES-chirho/README-chirho.md).

## For contributors and agents

Project rules are in [`AGENTS.md`](AGENTS.md). The design proposal is in
[`spec-chirho/design-chirho/`](spec-chirho/design-chirho/26-11-13-proposed-design-chirho.md).
