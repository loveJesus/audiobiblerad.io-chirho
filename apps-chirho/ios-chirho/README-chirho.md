<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Audio Bible Radio for iPhone and Apple Watch

Native SwiftUI radios that play the audio Bible as quickly as turning on a radio. The iPhone app
carries a standalone Watch app that needs no iPhone. Both stream each recording straight from its
publisher's own host and show that recording's credit and licence. No Scripture audio is bundled.

## Layout

| Path                                           | What it is                                                                                                                                |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `AudioBibleRadioChirho.xcodeproj`              | One project: the iPhone app embeds the Watch app.                                                                                         |
| `RadioCoreChirho/`                             | The Swift package both apps share.                                                                                                        |
| `RadioCoreChirho/Sources/RadioCoreChirho/`     | Foundation only: the catalogue contract, chapter addresses, positions, the remembered place, the first station and the radio's decisions. |
| `RadioCoreChirho/Sources/RadioPlaybackChirho/` | AVPlayer streaming, the audio session, lock-screen and Watch controls, verse timings, interface sounds and the model the views hold.      |
| `RadioCoreChirho/Tests/RadioCoreChirhoTests/`  | Tests of the core on a Mac, with a fake player.                                                                                           |
| `RadioPhoneChirho/`                            | The iPhone screens.                                                                                                                       |
| `RadioWatchChirho/`                            | The Watch screens. The crown is the dial.                                                                                                 |
| `SupportChirho/`                               | Info.plist additions: background audio.                                                                                                   |

Both apps bundle two things from `../shared-chirho/` by reference, never by copy:

- `catalogue_chirho.json`: the 29 built-in stations, generated from the web catalogue by
  `bun scripts-chirho/native-chirho/export_catalogue_chirho.ts`. The first On reads only this file.
- `native-assets-chirho/`: the interface sounds and their profile, written by the native sound
  preparer and ignored by Git. Owner builds hold the purchased effects; a public clone prepares the
  original open set. The folder must be prepared before an app build.

## What the radio does

- **Power.** It plays on opening, unless the listener's last word was Off.
- **Watch output.** The Watch needs headphones, or the built-in speaker on supported models from
  watchOS 11 (not while charging). When no output can be chosen, it stays off and says so.
- **Dial.** It keeps the book and chapter. It carries the place by verse when both recordings have
  verse timings, otherwise by fraction. A station that lacks the passage plays its next chapter and
  keeps the listener's place for the next station.
- **Chapters.** Each chapter runs into the next. A missing or unplayable file is skipped, up to
  three times, and the remembered place moves only once a replacement actually plays. A network
  failure never skips a chapter.
- **System controls.** The lock screen, Control Center, headphones and the Watch's Now Playing
  offer play, pause, previous and next chapter, and seeking within the chapter. They never make
  interface sounds.
- **Sounds.** Static plays while a deliberately tuned station loads. A click plays for presses and a
  knob detent for an accepted dial step. A sounding click or tick finishes before another tick. The
  Sound switch silences and unloads them; system Off and interruptions silence them without changing
  the switch. Watch effects wait for completed output activation. On-screen Off lets its click finish
  before giving the route back, at most one second later; a newer On cancels that deferred release.
- **Memory.** It remembers the station, passage, position, followed place, Off and the Sound switch
  on the device. Nothing else is kept.

Not in these apps yet: recordings that the browser loads by language (Davar Audio Bibles, whose
native access is unresolved), chapters split across several files, a catalogue refresh after
install, translated interface text and recording artwork. Both targets include waveform app icons,
required-reason privacy manifests, and Help and Privacy links to the public website.

The identifiers `io.audiobiblerad.radiochirho` and
`io.audiobiblerad.radiochirho.watchkitapp` are registered for distribution preparation. This does
not establish a signed store candidate, submission or public listing. Real simulator captures and
their dimensions are recorded in `store-assets-chirho/screenshots_chirho.json`; they contain no
generated interface or promotional overlays. Physical output and device-only controls remain
separate acceptance gates.

## Checks

```bash
scripts-chirho/native-chirho/ios-chirho/check_core_chirho.sh          # all of the below
scripts-chirho/native-chirho/ios-chirho/check_core_chirho.sh core     # snapshot, parity and swift test
scripts-chirho/native-chirho/ios-chirho/check_core_chirho.sh typecheck
```

The core check confirms the bundled snapshot matches the web catalogue, then has the web's own
TypeScript write its answer for every station and chapter to a temporary file. `swift test` then
compares the Swift answers to it row by row, alongside the controller tests. The type-check compiles
the playback and app sources against the iOS and watchOS SDKs without linking anything. None of
these builds an app, starts a simulator or touches a device.

Unsigned simulator app builds use the normal entries below from the repository root. They check the snapshot and prepare sounds first, select isolated external-first DerivedData with automatic local fallback, and pin that backend for the invocation. They keep temporary files on internal storage, inherit no provider credentials, use two compiler jobs and disable signing. They do not boot a simulator or download an SDK.

```bash
bun scripts-chirho/native-chirho/ios-chirho/build_app_chirho.ts phone --require-licensed-chirho
bun scripts-chirho/native-chirho/ios-chirho/build_app_chirho.ts watch --require-licensed-chirho
```

A public clone omits `--require-licensed-chirho` to prepare the original CC0 effects. `--cache-probe-chirho` exercises selection without compiling. App builds need 4 GiB free on both internal and selected storage at admission; the owned build stops if the pinned backend or runtime floors disappear. A failed cache lock is reported for its owner to reconcile, never stolen by a second build. Xcode 27 or later is required. Building for a device needs a signing team, which this project does not set.
