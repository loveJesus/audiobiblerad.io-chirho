<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# What the owner asked for

L.J. started this project on 2026-11-13. His exact words are kept outside version control in
`workspace-chirho/private-chirho/26-11-13-owner-words-chirho.md`, because this repository is
public. Read that file before planning: it is the instruction, and this page is only a summary of
it.

## What he said

- A project for **iOS including Apple Watch, Android, and web**, called **Audio Bible Radio**, in
  **many languages**.
- **Its whole point is playing the audio Bible fast.** It should quickly play from any language and
  version that is publicly available to us, with very low friction.
- It would be neat to have **sound effects when changing versions**, like the static of turning a
  radio knob, or beeps and flips: about **nine different random radio noises**. They must be
  **toggleable**.
- The domain is **audiobiblerad.io**. He chose it and registered it the same day.
- The project gets **its own fleet, which does its own building**.
- It has a **GitHub open-source remote ready to push to**.

## How this was read

- "Fast" is taken to mean the time from opening the app to hearing Scripture, and from turning the
  dial to hearing the next version. Playback speed control is welcome but is not the point.
- "In many languages" is taken to mean the audio. Whether the interface and the store name are also
  translated has not been said.
- "Publicly available to us" is taken to mean sources whose terms allow us to play them. See
  `spec-chirho/sources-chirho/26-11-13-public-audio-sources-chirho.md`.

If any of these readings is wrong, ask him. Do not build on a guess.

## Decisions confirmed since setup

- On 2026-11-14 L.J. approved publishing the source and licence. The source is public on GitHub under GPL-3.0-or-later with the section 7 app-store permission; the original radio sounds are CC0. Scripture recordings retain their publishers' terms.
- On 2026-11-14, after pausing the earlier deployment request, L.J. said "i think publish it" in the discussion about putting the radio on `audiobiblerad.io`. This resumes web deployment and the domain connection. It does not settle native packaging, store identifiers, provider key requests or paid services.
- On 2026-11-16 L.J. chose native iOS/Apple Watch and Android apps. Permanent store identifiers, app records and release remain separate decisions. He also clarified that 3D should use distinct radio models within orbitable surroundings, loaded only after the listener switches to 3D; the lightweight initial page stays fast.

## What he has not said

Nobody should invent an answer to these. Ask once, through the coordinator.

- Whether the apps are free with no ads and no accounts. The largest audio source requires free
  access, so anything else would rule that source out.
- App identifiers for the stores. They are permanent once published.
- Whether the interface text and the store listing are translated, and into which languages first.
- What plays first when someone opens it for the very first time.
- Whether a synthetic voice is acceptable as a station, and how it should be labelled.

## What only he can do

- Ask Faith Comes By Hearing for a Bible Brain API key. A draft of the request is in
  `workspace-chirho/private-chirho/outreach-chirho/`. It is not sent.
- Approve the first push to the public repository, the licence, any deploy, any DNS change, any
  store listing, and any spending.
