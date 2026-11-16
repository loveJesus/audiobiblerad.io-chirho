<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Native Android radio

This is a native Views/Media3 application. The activity renders the service's state; one controller owns playback, On/Off, station and chapter selection, recovery and remembered position. Lock-screen and headset actions are quiet. App controls can play the prepared click, detent and tuning effects. The first opening starts listening unless the last explicit choice was Off.

The first vertical bundles the shared metadata snapshot: 29 stations in 26 languages. Scripture streams directly from each publisher. Credits, source and licence links are visible. Davar, split chapters, verse-based position mapping, catalogue refresh and interface translation are not included in this cut. This is a development app, with a provisional identifier and no Play listing or release signing.

Run from the repository root:

```bash
bun scripts-chirho/native-chirho/android-chirho/build_chirho.ts
```

The normal entry checks the shared catalogue and web-resolver parity fixture, prepares native sounds, and runs unit tests, lint and a debug APK build with two workers and no persistent daemon. It uses installed Gradle 9.8.2 and a validated JDK 17 or later. AGP 9.5.1 and Media3 1.11.1 are pinned. Compile and target SDK are 37; build tools are 36.0.0. Automatic SDK downloads are disabled, so the installed platform is required.

To require the owner's locally licensed effects:

```bash
bun scripts-chirho/native-chirho/android-chirho/build_chirho.ts --require-licensed-chirho
```

A public clone uses the original CC0 effects. Purchased originals and prepared clips are excluded from Git. Their app-use rights do not license extraction or redistribution as samples. The preparer stages only the selected profile and its files; the APK does not contain original WAVs or preparation manifests.

Build outputs use the per-worktree `android-gradle-chirho` cache selected at invocation, preferring the validated external volume and falling back locally when it is unavailable. A running job pins its backend and stops if it disappears. Per-run temporary files stay on the worktree's local device on macOS and are removed after the job. Cache selection does not start an emulator or download a toolchain.

The controller's JVM tests exercise synchronous playback callbacks, pending fractions across Off and process recreation, bounded recovery, stale events, explicit Off, strict memory and quiet system actions. The parity test compares all 34,481 station/chapter positions against the web resolver. These checks and a packaged APK do not establish physical audio, background continuation, notification/headset behavior or store acceptance. Runtime observations and retained failures are recorded in `spec-chirho/evidence-chirho/native-first-chirho/verification_chirho.json`.

The service is privately bound by this app. This cut does not offer Android Auto browsing or playback resumption through a media-button receiver. No command here provisions a key, creates a store record, uploads a release or changes the public website.
