<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Native players

L.J. confirmed native iOS/Apple Watch and Android on 2026-11-16. The first native vertical uses the existing built-in catalogue, with its actual source licences and visible credits. Davar native access remains unresolved and is not implied by its browser playback. Native builds, simulator checks, physical-device results and store acceptance are separate evidence scopes.

```mermaid
flowchart TD
    catalogue_chirho[Canonical web catalogue contract] --> export_chirho[Export shared built-in metadata snapshot]
    export_chirho --> bundle_chirho[Bundle metadata with iOS, Watch and Android]
    bundle_chirho --> open_chirho[Open native radio with a chapter already resolvable]
    open_chirho --> on_chirho[On through the native playback controller]
    on_chirho --> source_chirho[Stream audio directly from publisher]
    source_chirho --> platform_chirho[Publish native media session and logical chapter position]
    platform_chirho --> command_chirho[App, headset or system control]
    command_chirho --> on_chirho
    source_chirho --> save_chirho[Remember validated station and passage locally]
    source_chirho --> next_chirho[Advance to the next offered chapter]
    next_chirho --> source_chirho
    open_chirho --> notices_chirho[Show selected source, licence and recording credit]
    bundle_chirho --> build_chirho[Select isolated external-first build cache with local fallback]
    build_chirho --> admission_chirho[Fresh disk and toolchain checks; serialize substantial builds]
    admission_chirho --> resources_chirho[Prepare exact catalogue, effects, icons and required-API manifests]
    resources_chirho --> local_chirho[Unsigned local build and exact-scope tests]
    local_chirho --> inspect_chirho[Inspect built app roots, icon metadata and exact resource inventory]
    inspect_chirho --> record_chirho
    local_chirho --> record_chirho[Record actual results and unresolved device work]
```

`scripts-chirho/native-chirho/export_catalogue_chirho.ts` writes the one generated snapshot at `apps-chirho/shared-chirho/catalogue_chirho.json`. It includes metadata and addresses, not Scripture audio. Run it with `--check-chirho` before a native build to detect stale metadata. Both native apps should reference this same source resource; the first On does not depend on a remote catalogue fetch. A future catalogue refresh must preserve the current usable copy on failure.

iOS and Watch share Swift playback/catalogue code; Android uses its platform player and media session. The Watch view stays lightweight and uses the crown for station selection. The web renderer is not a native playback dependency. Each player must preserve explicit Off, bound network failures, validate remembered positions and display the playing recording's terms. The initial vertical does not establish complete web feature parity.

Apple playback configuration follows [media playback setup](https://developer.apple.com/documentation/avfoundation/configuring-your-app-for-media-playback), [Watch background audio](https://developer.apple.com/documentation/watchkit/playing-background-audio) and [Watch session activation](<https://developer.apple.com/documentation/avfaudio/avaudiosession/activate(options:completionhandler:)>). A Watch needs a supported output route; activation failure must be visible. Android's implementation follows the official Media3 playback/session documentation and pins suitable stable tooling after checking the installed SDK.

Build scripts select per-worktree/profile compiler outputs through the shared cache selector, keep source, signing material, runtime data and evidence outside the unencrypted external cache, and never change backend mid-build. Local development identifiers are provisional. No build script creates store records, registers identifiers, provisions signing, uploads an app or contacts a recording publisher.

Apple output activation is a request until it completes. An activation that arrives after Off is released; one needed by a newer On is kept. Watch effect sounds require completed activation. System Off, interruptions and output loss stop both effect channels without changing Sound. On-screen Off can let its own short click finish before releasing the route, bounded at one second; an epoch cancels that deferred release when a newer activation starts. The controller's late-activation rule has fake-route red/green tests. Platform sound/output behavior still needs device checks.

```mermaid
flowchart TD
    screen_chirho[Android activity opens] --> connect_chirho[Connect to the privately bound MediaSessionService]
    connect_chirho --> state_chirho[Render the one published controller state]
    system_chirho[Lock screen, notification or headset] --> facade_chirho[Quiet system actions through the player facade]
    input_chirho[App press or dial step] --> command_chirho[Own-app command with deliberate feedback]
    facade_chirho --> controller_chirho[RadioControllerChirho]
    command_chirho --> controller_chirho
    controller_chirho --> waiting_chirho[Set loading state and timeout before calling the transport]
    waiting_chirho --> exo_chirho[ExoPlayer loads one publisher chapter]
    exo_chirho --> event_chirho[Generation-fenced events, including synchronous callbacks]
    event_chirho --> controller_chirho
    controller_chirho --> effects_chirho[Two SoundPool channels; no effect from a system action]
    controller_chirho --> memory_chirho[Validated current and followed places, saved at transitions and every five seconds]
    memory_chirho --> reopen_chirho[Reopen: own seconds, or followed fraction for a genuinely unplayed narration]
    reopen_chirho --> controller_chirho
```

Apple remembered starts have two separate waits: the stream becoming ready and the initial seek completing. `PlayerIntentChirho` keeps On waiting through both, and treats a paused report as a platform pause only after this generation was actually told to play. Off, interruptions and replacement generations fence readiness and seek callbacks. A later deliberate seek must not strand the original placement. Foundation-only tests exercise these decisions; actual AVPlayer resume is checked separately.

Android distinguishes the listener's explicit Off from output or audio-focus loss. Both power down quietly and keep the place, but only a deliberate user pause/Off persists the opening choice. Each screen connection asks for opening autoplay; the controller owns the once-per-session guard. The platform session carries an immutable launch intent so its notification can open this app.

Apple resource builds must keep the mandatory `PrivacyInfo.xcprivacy` filename at each app bundle root. The native Phone and Watch catalogues use opaque app icons; inspect `Assets.car` and the actual icon plist keys after building, including the embedded Watch copy. Required-API reasons describe only observed defaults and elapsed-time uses. They do not stand in for the owner's store data-collection, tracking or export declarations.
