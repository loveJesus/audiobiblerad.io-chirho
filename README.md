<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Audio Bible Radio

The audio Bible in many languages. Turn it on and it plays.

Audio Bible Radio is a free ministry project from Love Jesus Software for the web, iOS including
Apple Watch, and Android. It works like a radio: tap once on the web and Scripture plays; turn the
dial and it plays in another language or version.

Home: [audiobiblerad.io](https://audiobiblerad.io)

## Status

The local web radio plays verified recordings directly from their source hosts. It remembers a
station and passage on the device, continues through chapters, shows recording credits, and has
nine original, toggleable tuning sounds. Verse timings carry the place between timed recordings;
other station changes use the fraction of the chapter. Partial recordings skip to their next
verified chapter.

Native apps await the owner's packaging decision. Bible Brain integration awaits the owner's
key and confirmation of the permitted server arrangement. The software licence and first public
push are also pending. Nothing is deployed and the registered domain remains parked.

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

Recording credits are at `/credits-chirho`. `/catalogue-chirho` serves the same JSON-safe, cleared
catalogue used by the web player for future native clients. No provider key belongs in that data.

## For contributors and agents

Project rules are in [`AGENTS.md`](AGENTS.md). The design proposal is in
[`spec-chirho/design-chirho/`](spec-chirho/design-chirho/26-11-13-proposed-design-chirho.md).
