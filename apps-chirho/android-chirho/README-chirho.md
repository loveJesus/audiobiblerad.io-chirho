<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Native Android radio

This is a native Views/Media3 application. The activity renders the service's state; one controller owns playback, On/Off, station and chapter selection, recovery and remembered position. Lock-screen and headset actions are quiet. Tapping the notification or the system media player opens the radio's screen. App controls can play the prepared click, detent and tuning effects. Opening the app starts listening unless the listener's last choice was Off, including a screen rebuilt during startup or restored after its process ended. Headphones coming out, or another app taking the audio, turn the radio off quietly; that is not the listener's Off, so the next opening still plays.

The first vertical bundles the shared metadata snapshot: 29 stations in 26 languages. Scripture streams directly from each publisher. Credits, source and licence links are visible. Help and Privacy open the website's support and privacy pages in the browser. Davar, split chapters, verse-based position mapping, catalogue refresh and interface translation are not included in this cut. This is a development app, with a provisional identifier and no Play listing or release signing.

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

The controller's JVM tests exercise synchronous playback callbacks, pending fractions across Off and process recreation, bounded recovery, stale events, explicit Off versus a platform pause, strict memory and quiet system actions. The parity test compares all 34,481 station/chapter positions against the web resolver. These checks and a packaged APK do not establish physical audio, background continuation, notification/headset behavior or store acceptance. Runtime observations and retained failures are recorded in `spec-chirho/evidence-chirho/native-first-chirho/verification_chirho.json`.

The service is privately bound by this app. This cut does not offer Android Auto browsing or playback resumption through a media-button receiver. No command here provisions a key, creates a store record, uploads a release or changes the public website.

Store artwork lives in `store-assets-chirho/`, outside the application's assets. The launcher, store icon and website share the waveform mark. Edit the SVG sources and export with the installed Inkscape CLI; no application build is needed:

```bash
inkscape apps-chirho/android-chirho/store-assets-chirho/play_icon_chirho.svg --export-type=png --export-background='#292e2b' --export-background-opacity=1 --export-filename=apps-chirho/android-chirho/store-assets-chirho/exports-chirho/play_icon_chirho.png
inkscape apps-chirho/android-chirho/store-assets-chirho/play_feature_graphic_chirho.svg --export-type=png --export-background='#292e2b' --export-background-opacity=1 --export-filename=/private/tmp/play_feature_render_chirho.png
magick /private/tmp/play_feature_render_chirho.png -alpha off -strip PNG24:apps-chirho/android-chirho/store-assets-chirho/exports-chirho/play_feature_graphic_chirho.png
```

The exports are an opaque 512×512 icon and a 1024×500 RGB feature graphic. Check the rendered image and dimensions before uploading. Screenshots come from the running app, separately from this artwork.

Four real Android screenshots are prepared in `store-assets-chirho/screens-phone-chirho/`, with hashes and capture descriptions in `store-assets-chirho/screenshots_chirho.json`. Each is 1080×1920, with unchanged RGB pixels and no crop; Android's system demo mode supplies the clean status bar. The capture run also recorded stalls and decoder underruns, so these images do not establish playback performance or release acceptance. The retained emulator's display override was reset before graceful power-off; check its actual size at the next authorized boot because an earlier reset verified live did not persist through `emu kill`.
