<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# First bricks

Tick a box when the step is truly done and checked, not when it is started.

## Brick 0: setup (done by the AICEO Claude2 seat, 2026-11-13)

- [x] Scaffold SvelteKit 2 on Cloudflare Workers, branch `main_chirho`.
- [x] Replace the template's demo with one real unit, component and browser test.
- [x] Read the public audio sources and their terms:
      `spec-chirho/sources-chirho/26-11-13-public-audio-sources-chirho.md`.
- [x] Record what the owner asked for and what he has not decided:
      `spec-chirho/client-chirho/26-11-13-owner-request-chirho.md`.
- [x] Propose a design: `spec-chirho/design-chirho/26-11-13-proposed-design-chirho.md`.
- [x] Confirm the domain record at the registrar, read-only.
- [x] Create the public GitHub repository and wire it as `gh_chirho`. Nothing pushed.

## Brick 1: the fleet takes over

- [ ] Every seat reads `AGENTS.md`, the owner's words, the sources file and the design proposal.
- [ ] Post once in the room: who you are and which brick you take.
- [ ] Agree who owns which paths, so two seats never edit the same files.
- [ ] The coordinator puts the open decisions to L.J. in one short message: licence, native or
      wrapped, app identifiers, the Bible Brain key request.

## Brick 2: the catalogue

- [ ] Fix the station contract: language, version, voice, voice kind, source, licence, credit, and
      how to find a chapter (pattern, index or resolver).
- [ ] Build stations for the sources that need no key, each with its licence and credit.
- [ ] Check chapter availability instead of assuming it, politely, and record what is missing.
- [ ] Tests for address building against the addresses verified in the sources file.

## Brick 3: the web radio

- [ ] One screen: tap once and Scripture plays.
- [ ] The dial changes station and keeps the book and chapter.
- [ ] Position carries over: same verse where timings exist, otherwise the same fraction.
- [ ] Next chapter plays on its own; a missing chapter is skipped.
- [ ] The last station and place are remembered on the device.
- [ ] Each station shows its credit and licence.
- [ ] Measure time to first sound and time to change station. Write the numbers down.

## Brick 4: the radio sounds

- [ ] A deterministic script that synthesises nine short radio sounds. Nothing downloaded.
- [ ] They play while the next station loads and stop when its audio starts.
- [ ] One remembered switch turns them off.

## Brick 5: iOS and Apple Watch (after L.J. confirms native)

- [ ] Check free disk space first. The build machine was 99% full on 2026-11-13.
- [ ] One project with a shared package; plays from the same catalogue; background audio and
      lock-screen controls.
- [ ] Watch app: the crown is the dial.

## Brick 6: Android (after L.J. confirms native)

- [ ] Plays from the same catalogue with a media session, so the lock screen and headphones work.

## Brick 7: Bible Brain (after L.J. has the key)

- [ ] Resolver endpoint that serves our own apps only; the key stays in the server's secret store.
- [ ] Copyright information reachable from every chapter, and their terms shown to listeners.
- [ ] No downloads and no offline copies of their content.

## Brick 8: going live (L.J.'s gate)

- [ ] A licence and credits page that lists every station's source.
- [ ] Ask L.J. before any deploy, DNS change, store listing or first push.
