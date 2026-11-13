<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Audio Bible Radio

The audio Bible in many languages. Turn it on and it plays.

Audio Bible Radio is a free ministry project from Love Jesus Software for the web, iOS including
Apple Watch, and Android. It works like a radio: open it and Scripture plays; turn the dial and it
plays in another language or version.

Home: [audiobiblerad.io](https://audiobiblerad.io)

## Status

Early. The project was started on 2026-11-13. The web app is a scaffold, the native apps are not
started, and nothing is deployed.

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
```

## For contributors and agents

Project rules are in [`AGENTS.md`](AGENTS.md). The design proposal is in
[`spec-chirho/design-chirho/`](spec-chirho/design-chirho/26-11-13-proposed-design-chirho.md).
